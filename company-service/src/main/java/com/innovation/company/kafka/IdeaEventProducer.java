package com.innovation.company.kafka;

import com.innovation.common.event.IdeaSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdeaEventProducer {
    
    private final KafkaTemplate<String, IdeaSubmittedEvent> kafkaTemplate;
    private static final String TOPIC = "idea-submitted-topic";
    
    public void publishIdeaSubmitted(IdeaSubmittedEvent event) {
        try {
            // Set metadata
            event.setEventId(UUID.randomUUID().toString());
            event.setSubmittedAt(LocalDateTime.now());
            
            log.info("📤 Publishing IdeaSubmittedEvent: ideaId={}, challengeId={}", 
                    event.getIdeaId(), event.getChallengeId());
            
            CompletableFuture<SendResult<String, IdeaSubmittedEvent>> future = 
                kafkaTemplate.send(TOPIC, event.getIdeaId().toString(), event);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("✅ Event published successfully: ideaId={}, partition={}, offset={}", 
                            event.getIdeaId(), 
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("❌ Failed to publish event: ideaId={}, error={}", 
                            event.getIdeaId(), ex.getMessage());
                }
            });
            
        } catch (Exception e) {
            log.error("❌ Error publishing IdeaSubmittedEvent: {}", e.getMessage(), e);
            // Don't throw - idea is already saved, Kafka is optional
        }
    }
}
