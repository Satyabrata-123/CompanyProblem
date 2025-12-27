"""
Kafka Consumer for Innovation Platform
Listens for IdeaSubmittedEvent and triggers AI comparison
"""

import json
import logging
import os
import asyncio
import requests
from kafka import KafkaConsumer
from kafka.errors import KafkaError
from datetime import datetime
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv("../.env")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(funcName)s] - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC = 'idea-submitted-topic'
KAFKA_GROUP_ID = 'chatmodel-consumer-group'
CHATMODEL_API_URL = 'http://localhost:5000'
IDEA_SERVICE_URL = 'http://localhost:8083/api/ideas'

class IdeaKafkaConsumer:
    def __init__(self):
        self.consumer = None
        self.running = False
        
    def connect(self):
        """Connect to Kafka"""
        try:
            logger.info(f"🔌 Connecting to Kafka at {KAFKA_BOOTSTRAP_SERVERS}...")
            
            self.consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                group_id=KAFKA_GROUP_ID,
                auto_offset_reset='latest',  # Start from latest messages
                enable_auto_commit=True,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                consumer_timeout_ms=1000  # Timeout for polling
            )
            
            logger.info(f"✅ Connected to Kafka successfully!")
            logger.info(f"📡 Subscribed to topic: {KAFKA_TOPIC}")
            logger.info(f"👥 Consumer group: {KAFKA_GROUP_ID}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Kafka: {str(e)}")
            return False
    
    def process_idea_event(self, event):
        """Process IdeaSubmittedEvent and trigger AI comparison"""
        try:
            idea_id = event.get('ideaId')
            challenge_id = event.get('challengeId')
            
            logger.info(f"📨 Processing IdeaSubmittedEvent: ideaId={idea_id}, challengeId={challenge_id}")
            
            # Fetch full idea details from idea-service
            idea_details = self.fetch_idea_details(idea_id)
            if not idea_details:
                logger.error(f"❌ Failed to fetch idea details for ideaId={idea_id}")
                return
            
            # Fetch challenge details (including company solution)
            challenge_details = self.fetch_challenge_details(challenge_id)
            if not challenge_details:
                logger.error(f"❌ Failed to fetch challenge details for challengeId={challenge_id}")
                return
            
            # Prepare comparison request
            comparison_request = {
                "ideaId": idea_id,
                "challengeId": challenge_id,
                "ideaTitle": idea_details.get('title', ''),
                "ideaDescription": idea_details.get('description', ''),
                "companySolution": challenge_details.get('companySolution', ''),
                "challengeTitle": challenge_details.get('title', ''),
                "challengeDescription": challenge_details.get('description', '')
            }
            
            logger.info(f"🤖 Triggering AI comparison for ideaId={idea_id}...")
            
            # Call ChatModel API for comparison
            response = requests.post(
                f"{CHATMODEL_API_URL}/chat/compare-with-solution",
                json=comparison_request,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                comparison = result.get('comparison', {})
                
                logger.info(f"✅ AI Comparison completed:")
                logger.info(f"   Match Score: {comparison.get('matchScore')}")
                logger.info(f"   Match Level: {comparison.get('matchLevel')}")
                logger.info(f"   Is Correct: {comparison.get('isCorrectSolution')}")
                
                # Send result back to idea-service
                self.send_comparison_result(idea_id, comparison)
                
            else:
                logger.error(f"❌ ChatModel API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ Error processing idea event: {str(e)}")
    
    def fetch_idea_details(self, idea_id):
        """Fetch idea details from idea-service"""
        try:
            response = requests.get(f"{IDEA_SERVICE_URL}/{idea_id}", timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Failed to fetch idea: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"❌ Error fetching idea: {str(e)}")
            return None
    
    def fetch_challenge_details(self, challenge_id):
        """Fetch challenge details from company-service"""
        try:
            response = requests.get(
                f"http://localhost:8081/api/challenges/{challenge_id}",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Failed to fetch challenge: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"❌ Error fetching challenge: {str(e)}")
            return None
    
    def send_comparison_result(self, idea_id, comparison):
        """Send comparison result back to idea-service"""
        try:
            update_request = {
                "matchScore": comparison.get('matchScore'),
                "matchLevel": comparison.get('matchLevel'),
                "isCorrectSolution": comparison.get('isCorrectSolution'),
                "feedback": comparison.get('feedback'),
                "strengths": comparison.get('strengths'),
                "improvements": comparison.get('improvements')
            }
            
            response = requests.put(
                f"{IDEA_SERVICE_URL}/{idea_id}/comparison-result",
                json=update_request,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Comparison result sent to idea-service for ideaId={idea_id}")
            else:
                logger.error(f"❌ Failed to send result: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ Error sending comparison result: {str(e)}")
    
    def start(self):
        """Start consuming messages"""
        if not self.connect():
            logger.error("❌ Cannot start consumer - connection failed")
            return
        
        self.running = True
        logger.info("🚀 Kafka consumer started. Waiting for messages...")
        logger.info("   Press Ctrl+C to stop")
        
        try:
            while self.running:
                try:
                    # Poll for messages
                    messages = self.consumer.poll(timeout_ms=1000)
                    
                    for topic_partition, records in messages.items():
                        for record in records:
                            logger.info(f"📬 Received message: partition={record.partition}, offset={record.offset}")
                            self.process_idea_event(record.value)
                    
                except KafkaError as e:
                    logger.error(f"❌ Kafka error: {str(e)}")
                    time.sleep(5)  # Wait before retrying
                    
        except KeyboardInterrupt:
            logger.info("⏹️  Stopping consumer...")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the consumer"""
        self.running = False
        if self.consumer:
            self.consumer.close()
            logger.info("✅ Consumer stopped")

def main():
    """Main entry point"""
    print("=" * 80)
    print("🎯 Innovation Platform - Kafka Consumer")
    print("=" * 80)
    print(f"Kafka Server: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Topic: {KAFKA_TOPIC}")
    print(f"Consumer Group: {KAFKA_GROUP_ID}")
    print(f"ChatModel API: {CHATMODEL_API_URL}")
    print("=" * 80)
    print()
    
    consumer = IdeaKafkaConsumer()
    consumer.start()

if __name__ == '__main__':
    main()
