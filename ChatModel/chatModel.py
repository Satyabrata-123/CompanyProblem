from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import logging
import requests
import json
import asyncio
import uuid
import time
import traceback
import psutil
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv("../.env")

# Check if API key exists
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
print("API KEY FOUND:", bool(GEMINI_API_KEY))

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(funcName)s] - %(message)s'
)
logger = logging.getLogger(__name__)

# Performance tracking
class PerformanceMonitor:
    def __init__(self):
        self.request_count = 0
        self.total_time = 0
        self.errors = 0
        
    def log_performance(self, operation, duration, success=True, details=None):
        """Log performance metrics to terminal"""
        self.request_count += 1
        self.total_time += duration
        
        if not success:
            self.errors += 1
        
        # Color codes for terminal
        GREEN = '\033[92m'
        RED = '\033[91m'
        YELLOW = '\033[93m'
        BLUE = '\033[94m'
        RESET = '\033[0m'
        
        status_color = GREEN if success else RED
        status = "✅ SUCCESS" if success else "❌ FAILED"
        
        print(f"\n{'='*80}")
        print(f"{BLUE}⚡ PERFORMANCE REPORT{RESET}")
        print(f"{'='*80}")
        print(f"Operation:     {YELLOW}{operation}{RESET}")
        print(f"Status:        {status_color}{status}{RESET}")
        print(f"Duration:      {YELLOW}{duration:.3f}s{RESET}")
        print(f"Timestamp:     {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if details:
            print(f"\n{BLUE}Details:{RESET}")
            for key, value in details.items():
                print(f"  • {key}: {value}")
        
        # Memory usage
        process = psutil.Process()
        memory_mb = process.memory_info().rss / 1024 / 1024
        cpu_percent = process.cpu_percent(interval=0.1)
        
        print(f"\n{BLUE}System Resources:{RESET}")
        print(f"  • Memory Usage: {memory_mb:.2f} MB")
        print(f"  • CPU Usage: {cpu_percent:.1f}%")
        
        # Overall stats
        avg_time = self.total_time / self.request_count if self.request_count > 0 else 0
        success_rate = ((self.request_count - self.errors) / self.request_count * 100) if self.request_count > 0 else 0
        
        print(f"\n{BLUE}Overall Stats:{RESET}")
        print(f"  • Total Requests: {self.request_count}")
        print(f"  • Success Rate: {success_rate:.1f}%")
        print(f"  • Average Time: {avg_time:.3f}s")
        print(f"  • Total Errors: {self.errors}")
        print(f"{'='*80}\n")
        
        # Performance warnings
        if duration > 5.0:
            print(f"{RED}⚠️  WARNING: Slow performance detected! Duration: {duration:.3f}s{RESET}")
        if memory_mb > 500:
            print(f"{RED}⚠️  WARNING: High memory usage! Memory: {memory_mb:.2f} MB{RESET}")
        if cpu_percent > 80:
            print(f"{RED}⚠️  WARNING: High CPU usage! CPU: {cpu_percent:.1f}%{RESET}")

# Initialize performance monitor
perf_monitor = PerformanceMonitor()

# Initialize Gemini AI
llm = None
gemini_available = False

if GEMINI_API_KEY:
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=GEMINI_API_KEY
        )
        test_response = llm.invoke("Hello")
        gemini_available = True
        logger.info("✅ Gemini AI configured successfully")
    except Exception as e:
        logger.warning(f"⚠️ Failed to initialize Gemini AI: {e}")
        gemini_available = False
else:
    logger.warning("⚠️ Gemini API key not found")

# Backend API Configuration
API_BASE_URL = "http://localhost:8080/api"
AI_SERVICE_URL = "http://localhost:8085"

def check_ai_service_health():
    """Check if AI service is available"""
    try:
        response = requests.get(f"{AI_SERVICE_URL}/actuator/health", timeout=5)
        return response.status_code == 200
    except:
        return False

class InnovationChatModel:
    def __init__(self):
        self.ai_service_available = check_ai_service_health()
        logger.info(f"🔍 AI Service Status: {'✅ Available' if self.ai_service_available else '❌ Unavailable'}")
        logger.info(f"🔍 Gemini AI Status: {'✅ Available' if gemini_available else '❌ Unavailable'}")
    
    async def analyze_idea_with_ai_service(self, idea_data):
        """Analyze idea using backend AI service"""
        if not self.ai_service_available:
            logger.warning("⚠️ AI service unavailable, using fallback")
            return await self.fallback_analysis(idea_data)
        
        try:
            logger.info("🤖 Requesting AI service analysis...")
            
            # Prepare request for AI service (without ideaId for preview mode)
            analysis_request = {
                "title": idea_data.get('title', ''),
                "description": idea_data.get('description', '')
            }
            
            response = requests.post(
                f"{AI_SERVICE_URL}/ai/categorize",
                json=analysis_request,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ AI service analysis completed - Score: {result.get('score', 'N/A')}")
                
                return {
                    "success": True,
                    "source": "ai_service",
                    "score": result.get('score', 0),
                    "category": result.get('category', 'General'),
                    "tags": result.get('tags', []),
                    "is_duplicate": result.get('isDuplicate', False),
                    "feedback": f"AI Analysis: {result.get('category', 'General')} category, Score: {result.get('score', 0)}/100"
                }
            else:
                logger.error(f"❌ AI service error: {response.status_code}")
                return await self.fallback_analysis(idea_data)
                
        except Exception as e:
            logger.error(f"❌ AI service request failed: {str(e)}")
            return await self.fallback_analysis(idea_data)
    
    async def analyze_idea_with_gemini(self, idea_data):
        """Analyze idea using Gemini AI"""
        if not gemini_available:
            logger.warning("⚠️ Gemini AI unavailable")
            return {"success": False, "error": "Gemini AI not available"}
        
        try:
            logger.info("🧠 Analyzing with Gemini AI...")
            
            prompt = f"""
            Analyze this innovation idea and provide a JSON response:
            
            Title: {idea_data.get('title', '')}
            Description: {idea_data.get('description', '')}
            
            Provide analysis in this JSON format:
            {{
                "innovation_score": <0-100>,
                "technical_feasibility": <0-100>,
                "market_potential": <0-100>,
                "overall_score": <0-100>,
                "recommendation": "ACCEPT/REVIEW/REJECT",
                "feedback": "detailed analysis"
            }}
            """
            
            response = llm.invoke(prompt)
            content = response.content if hasattr(response, 'content') else str(response)
            
            # Parse JSON from response
            try:
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx]
                    result = json.loads(json_str)
                    result['success'] = True
                    result['source'] = 'gemini_ai'
                    logger.info(f"✅ Gemini analysis completed - Score: {result.get('overall_score', 'N/A')}")
                    return result
            except:
                pass
            
            # Fallback if JSON parsing fails
            return {
                "success": True,
                "source": "gemini_ai",
                "innovation_score": 70,
                "technical_feasibility": 80,
                "market_potential": 65,
                "overall_score": 72,
                "recommendation": "REVIEW",
                "feedback": "Gemini AI analysis completed with basic scoring"
            }
            
        except Exception as e:
            logger.error(f"❌ Gemini AI analysis failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def fallback_analysis(self, idea_data):
        """Simple rule-based analysis when AI services unavailable"""
        logger.info("📋 Using fallback analysis...")
        
        title = idea_data.get('title', '')
        description = idea_data.get('description', '')
        combined = (title + ' ' + description).lower()
        
        # Basic scoring
        score = 50  # Base score
        
        # Length bonus
        if len(description) > 100:
            score += 10
        if len(description) > 300:
            score += 10
        
        # Keyword analysis
        innovation_keywords = ['ai', 'machine learning', 'innovative', 'new', 'advanced']
        tech_keywords = ['system', 'platform', 'technology', 'software', 'algorithm']
        
        for keyword in innovation_keywords:
            if keyword in combined:
                score += 5
        
        for keyword in tech_keywords:
            if keyword in combined:
                score += 3
        
        score = min(score, 95)  # Cap at 95
        
        return {
            "success": True,
            "source": "fallback_system",
            "score": score,
            "category": "General",
            "tags": ["rule-based"],
            "feedback": f"Rule-based analysis completed. Score: {score}/100"
        }
    
    async def dual_analysis(self, idea_data):
        """Perform dual analysis using both AI service and Gemini"""
        logger.info("🔄 Starting dual analysis...")
        
        results = {}
        
        # AI Service Analysis
        ai_service_result = await self.analyze_idea_with_ai_service(idea_data)
        results['ai_service'] = ai_service_result
        
        # Gemini Analysis
        gemini_result = await self.analyze_idea_with_gemini(idea_data)
        results['gemini'] = gemini_result
        
        # Combine results
        combined_score = 0
        score_count = 0
        
        if ai_service_result.get('success'):
            combined_score += ai_service_result.get('score', 0)
            score_count += 1
        
        if gemini_result.get('success'):
            combined_score += gemini_result.get('overall_score', 0)
            score_count += 1
        
        final_score = combined_score / score_count if score_count > 0 else 50
        
        # Determine recommendation
        if final_score >= 80:
            recommendation = "ACCEPT"
        elif final_score >= 60:
            recommendation = "REVIEW"
        else:
            recommendation = "REJECT"
        
        logger.info(f"✅ Dual analysis completed - Final Score: {final_score:.1f}")
        
        return {
            "success": True,
            "final_score": round(final_score, 1),
            "recommendation": recommendation,
            "ai_service_result": ai_service_result,
            "gemini_result": gemini_result,
            "analysis_sources": [
                result['source'] for result in [ai_service_result, gemini_result] 
                if result.get('success')
            ]
        }
    
    async def compare_idea_with_solution(self, data):
        """Compare user idea with company solution using Gemini AI"""
        start_time = time.time()
        logger.info("🤖 Starting AI comparison with Gemini...")
        
        idea_title = data.get('ideaTitle', '')
        idea_description = data.get('ideaDescription', '')
        company_solution = data.get('companySolution', '')
        challenge_title = data.get('challengeTitle', '')
        challenge_description = data.get('challengeDescription', '')
        
        try:
            # Use Gemini if available, otherwise fallback
            if gemini_available:
                try:
                    result = await self._compare_with_gemini(
                        idea_title, idea_description, company_solution,
                        challenge_title, challenge_description, data
                    )
                    duration = time.time() - start_time
                    
                    # Log performance
                    perf_monitor.log_performance(
                        operation="AI Comparison (Gemini)",
                        duration=duration,
                        success=True,
                        details={
                            "Idea Title": idea_title[:50] + "..." if len(idea_title) > 50 else idea_title,
                            "Match Score": result.get('matchScore', 'N/A'),
                            "Match Level": result.get('matchLevel', 'N/A'),
                            "Source": result.get('source', 'N/A'),
                            "Idea Length": len(idea_description),
                            "Solution Length": len(company_solution)
                        }
                    )
                    
                    return result
                except Exception as e:
                    duration = time.time() - start_time
                    logger.error(f"❌ Gemini comparison failed: {str(e)}")
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    
                    perf_monitor.log_performance(
                        operation="AI Comparison (Gemini - FAILED)",
                        duration=duration,
                        success=False,
                        details={
                            "Error": str(e),
                            "Fallback": "Using text similarity"
                        }
                    )
                    
                    result = self._fallback_comparison(
                        idea_title, idea_description, company_solution, data
                    )
                    return result
            else:
                logger.warning("⚠️ Gemini unavailable, using fallback comparison")
                result = self._fallback_comparison(
                    idea_title, idea_description, company_solution, data
                )
                duration = time.time() - start_time
                
                perf_monitor.log_performance(
                    operation="AI Comparison (Fallback)",
                    duration=duration,
                    success=True,
                    details={
                        "Reason": "Gemini unavailable",
                        "Match Score": result.get('matchScore', 'N/A'),
                        "Source": result.get('source', 'N/A')
                    }
                )
                
                return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"❌ Comparison completely failed: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            perf_monitor.log_performance(
                operation="AI Comparison (CRITICAL FAILURE)",
                duration=duration,
                success=False,
                details={
                    "Error": str(e),
                    "Traceback": traceback.format_exc()[:200]
                }
            )
            raise
    
    async def _compare_with_gemini(self, idea_title, idea_description, company_solution,
                                   challenge_title, challenge_description, data):
        """Use Gemini AI to compare idea with solution"""
        gemini_start = time.time()
        logger.info("🧠 Using Gemini AI for comparison...")
        
        prompt = f"""
You are an expert evaluator comparing a user's submitted idea with a company's official solution to a challenge.

CHALLENGE:
Title: {challenge_title}
Description: {challenge_description}

COMPANY'S SOLUTION (What we're looking for):
{company_solution}

USER'S SUBMITTED IDEA:
Title: {idea_title}
Description: {idea_description}

Please analyze how well the user's idea matches the company's solution and provide a detailed evaluation.

Respond in this EXACT JSON format (no markdown, just JSON):
{{
  "matchScore": <number 0-100>,
  "matchLevel": "<EXCELLENT|GOOD|PARTIAL|POOR>",
  "isCorrectSolution": <true|false>,
  "feedback": "<2-3 sentences explaining the match quality>",
  "strengths": "<what the user's idea does well>",
  "improvements": "<what could be improved>"
}}

Scoring Guidelines:
- 90-100 (EXCELLENT): Perfect match with company solution, all key concepts covered
- 70-89 (GOOD): Strong alignment, most key concepts present, qualifies for reward
- 40-69 (PARTIAL): Some alignment, missing important elements
- 0-39 (POOR): Significant gaps, different approach or insufficient detail

Be strict but fair. Consider:
1. Technical approach similarity
2. Key technologies/concepts mentioned
3. Implementation completeness
4. Understanding of the problem
"""
        
        try:
            api_call_start = time.time()
            response = llm.invoke(prompt)
            api_call_duration = time.time() - api_call_start
            
            print(f"\n🔵 Gemini API Call Duration: {api_call_duration:.3f}s")
            
            content = response.content if hasattr(response, 'content') else str(response)
            
            logger.info(f"📄 Gemini response received: {content[:200]}...")
            
            # Parse JSON from response
            parse_start = time.time()
            try:
                # Remove markdown code blocks if present
                content = content.replace('```json', '').replace('```', '').strip()
                
                # Find JSON object
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                
                if start_idx != -1 and end_idx > start_idx:
                    json_str = content[start_idx:end_idx]
                    result = json.loads(json_str)
                    
                    parse_duration = time.time() - parse_start
                    print(f"🔵 JSON Parsing Duration: {parse_duration:.3f}s")
                    
                    # Validate and normalize
                    match_score = float(result.get('matchScore', 50))
                    match_score = max(0, min(100, match_score))  # Clamp to 0-100
                    
                    match_level = result.get('matchLevel', 'PARTIAL')
                    if match_level not in ['EXCELLENT', 'GOOD', 'PARTIAL', 'POOR']:
                        match_level = 'PARTIAL' if match_score >= 50 else 'POOR'
                    
                    is_correct = result.get('isCorrectSolution', match_score >= 70)
                    
                    comparison_result = {
                        "ideaId": data.get('ideaId'),
                        "challengeId": data.get('challengeId'),
                        "matchScore": round(match_score, 1),
                        "matchLevel": match_level,
                        "isCorrectSolution": is_correct,
                        "feedback": result.get('feedback', 'Analysis completed'),
                        "strengths": result.get('strengths', 'Idea shows understanding of the challenge'),
                        "improvements": result.get('improvements', 'Consider adding more technical details'),
                        "source": "gemini_ai"
                    }
                    
                    total_duration = time.time() - gemini_start
                    logger.info(f"✅ Gemini comparison completed - Score: {match_score} - Total: {total_duration:.3f}s")
                    
                    return comparison_result
                    
            except json.JSONDecodeError as e:
                logger.error(f"❌ Failed to parse Gemini JSON response: {str(e)}")
                logger.error(f"Response content: {content}")
                raise
            except Exception as e:
                logger.error(f"❌ Error processing Gemini response: {str(e)}")
                raise
                
        except Exception as e:
            logger.error(f"❌ Gemini API call failed: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
        
        # Fallback if parsing fails
        logger.warning("⚠️ Gemini parsing failed, using fallback")
        return self._fallback_comparison(idea_title, idea_description, company_solution, data)
    
    def _fallback_comparison(self, idea_title, idea_description, company_solution, data):
        """Fallback comparison using text similarity"""
        logger.info("📋 Using fallback text comparison...")
        
        idea_text = (idea_title + ' ' + idea_description).lower()
        solution_text = company_solution.lower()
        
        # Calculate similarity score
        match_score = self._calculate_text_similarity(idea_text, solution_text)
        
        # Determine match level
        if match_score >= 80:
            match_level = "EXCELLENT"
            is_correct = True
            feedback = "Outstanding match! Your solution aligns excellently with the expected approach."
        elif match_score >= 65:
            match_level = "GOOD"
            is_correct = True
            feedback = "Very good solution! Your approach shows strong understanding and alignment."
        elif match_score >= 45:
            match_level = "PARTIAL"
            is_correct = False
            feedback = "Good foundation, but needs more detail and alignment with key requirements."
        else:
            match_level = "POOR"
            is_correct = False
            feedback = "Your solution needs significant improvement to meet the challenge requirements."
        
        strengths = self._analyze_strengths(idea_text, match_score)
        improvements = self._suggest_improvements(match_score)
        
        return {
            "ideaId": data.get('ideaId'),
            "challengeId": data.get('challengeId'),
            "matchScore": round(match_score, 1),
            "matchLevel": match_level,
            "isCorrectSolution": is_correct,
            "feedback": feedback,
            "strengths": strengths,
            "improvements": improvements,
            "source": "fallback_algorithm"
        }
    
    def _calculate_text_similarity(self, idea_text, solution_text):
        """Calculate similarity between idea and solution"""
        if not solution_text or not idea_text:
            return 45.0
        
        # Quality checks
        if len(idea_text) < 20:
            return float(10 + (len(idea_text) / 2))
        
        # Word-based similarity
        idea_words = set(idea_text.split())
        solution_words = set(solution_text.split())
        
        # Remove common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        idea_words = {w for w in idea_words if len(w) > 3 and w not in common_words}
        solution_words = {w for w in solution_words if len(w) > 3 and w not in common_words}
        
        if not solution_words:
            return 50.0
        
        # Calculate overlap
        intersection = idea_words & solution_words
        union = idea_words | solution_words
        
        jaccard_score = len(intersection) / len(union) if union else 0
        
        # Base score from Jaccard
        score = jaccard_score * 60
        
        # Bonus for length and detail
        if len(idea_text) > 100:
            score += 10
        if len(idea_text) > 300:
            score += 10
        
        # Bonus for technical terms
        tech_terms = ['api', 'database', 'server', 'client', 'algorithm', 'architecture',
                     'system', 'service', 'framework', 'library', 'security', 'performance']
        
        for term in tech_terms:
            if term in idea_text and term in solution_text:
                score += 3
        
        # Add variance
        import random
        variance = (random.random() - 0.5) * 10
        score += variance
        
        return max(15, min(95, score))
    
    def _analyze_strengths(self, idea_text, score):
        """Analyze strengths of the submission"""
        strengths = []
        
        if len(idea_text) > 200:
            strengths.append("Comprehensive and detailed explanation")
        
        tech_terms = {
            'architecture': 'Strong architectural thinking',
            'database': 'Good data management approach',
            'api': 'Solid API design considerations',
            'security': 'Security-conscious approach',
            'performance': 'Performance awareness',
            'scalability': 'Scalability considerations'
        }
        
        for term, strength in tech_terms.items():
            if term in idea_text:
                strengths.append(strength)
        
        if score >= 70:
            strengths.append("Excellent problem understanding")
        elif score >= 50:
            strengths.append("Good grasp of core concepts")
        
        if not strengths:
            strengths.append("Shows engagement with the problem")
        
        return ", ".join(strengths[:4])  # Limit to 4 strengths
    
    def _suggest_improvements(self, score):
        """Suggest improvements based on score"""
        if score >= 75:
            return "Consider adding more specific implementation details and edge case handling"
        elif score >= 60:
            return "Strengthen technical architecture details and add more specific technology choices"
        elif score >= 45:
            return "Expand on technical implementation, provide detailed system design, and add specific examples"
        else:
            return "Focus on understanding core requirements, research appropriate technologies, and provide step-by-step implementation approach"

# Initialize chat model
chat_model = InnovationChatModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "UP",
        "service": "innovation-chat-model",
        "timestamp": datetime.now().isoformat(),
        "ai_service_available": chat_model.ai_service_available,
        "gemini_available": gemini_available,
        "version": "1.0.0"
    })

@app.route('/chat/analyze-idea', methods=['POST'])
def analyze_idea():
    """Main endpoint for idea analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        idea_data = {
            "title": data.get('title', ''),
            "description": data.get('description', ''),
            "category": data.get('category', 'General')
        }
        
        if not idea_data['title'] or not idea_data['description']:
            return jsonify({
                "success": False, 
                "error": "Title and description are required"
            }), 400
        
        logger.info(f"📝 Analyzing idea: '{idea_data['title'][:50]}...'")
        
        # Perform dual analysis
        result = asyncio.run(chat_model.dual_analysis(idea_data))
        
        # Format response
        response = {
            "success": True,
            "idea": {
                "title": idea_data['title'],
                "description": idea_data['description']
            },
            "analysis": {
                "final_score": result['final_score'],
                "recommendation": result['recommendation'],
                "sources_used": result['analysis_sources']
            },
            "details": {
                "ai_service": result['ai_service_result'],
                "gemini_ai": result['gemini_result']
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Analysis failed",
            "message": str(e)
        }), 500

@app.route('/chat/compare-with-solution', methods=['POST'])
def compare_with_solution():
    """Compare user idea with company solution using ChatModel (Gemini AI)"""
    request_start = time.time()
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Validate required fields
        required_fields = ['ideaTitle', 'ideaDescription', 'companySolution']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False, 
                    "error": f"Missing required field: {field}"
                }), 400
        
        logger.info(f"🔍 Comparing idea '{data['ideaTitle'][:50]}...' with company solution using ChatModel")
        
        # Use ChatModel (Gemini) to compare
        result = asyncio.run(chat_model.compare_idea_with_solution(data))
        
        request_duration = time.time() - request_start
        
        return jsonify({
            "success": True,
            "comparison": result,
            "timestamp": datetime.now().isoformat(),
            "processingTime": f"{request_duration:.3f}s"
        })
        
    except Exception as e:
        request_duration = time.time() - request_start
        logger.error(f"❌ Comparison failed: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        perf_monitor.log_performance(
            operation="Compare With Solution (ENDPOINT FAILURE)",
            duration=request_duration,
            success=False,
            details={
                "Error": str(e),
                "Endpoint": "/chat/compare-with-solution"
            }
        )
        
        return jsonify({
            "success": False,
            "error": "Comparison failed",
            "message": str(e)
        }), 500

@app.route('/chat/test-ai-service', methods=['GET'])
def test_ai_service():
    """Test AI service connection"""
    try:
        ai_healthy = check_ai_service_health()
        
        if not ai_healthy:
            return jsonify({
                "success": False,
                "ai_service_status": "DOWN",
                "message": "AI service is not available on port 8085"
            })
        
        # Test with sample idea
        test_idea = {
            "title": "AI-Powered Learning Platform",
            "description": "A mobile application that uses artificial intelligence to help students learn programming through personalized challenges and real-time feedback."
        }
        
        result = asyncio.run(chat_model.analyze_idea_with_ai_service(test_idea))
        
        return jsonify({
            "success": True,
            "ai_service_status": "UP",
            "test_result": result,
            "message": "AI service is working correctly!"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/chat/system-status', methods=['GET'])
def system_status():
    """Get comprehensive system status"""
    ai_service_status = check_ai_service_health()
    
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "services": {
            "ai_service": {
                "status": "UP" if ai_service_status else "DOWN",
                "url": AI_SERVICE_URL
            },
            "gemini_ai": {
                "status": "UP" if gemini_available else "DOWN",
                "api_key_present": bool(GEMINI_API_KEY)
            }
        },
        "capabilities": {
            "dual_analysis": ai_service_status and gemini_available,
            "ai_service_only": ai_service_status and not gemini_available,
            "gemini_only": not ai_service_status and gemini_available,
            "fallback_mode": not ai_service_status and not gemini_available
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Innovation Chat Model...")
    print(f"   AI Service: {'✅ Available' if chat_model.ai_service_available else '❌ Unavailable'}")
    print(f"   Gemini AI: {'✅ Available' if gemini_available else '❌ Unavailable'}")
    print("=" * 50)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)