package com.c202.notification.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



// 알림 메시지 처리를 위한 메시지 브로커 구성
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange:alarm.exchange}")
    private String exchangeName;

    @Value("${rabbitmq.queue:alarm.created.queue}")
    private String queueName;

    @Value("${rabbitmq.routing-key:alarm.created}")
    private String routingKey;

    @Bean
    public Queue alarmQueue() {
        return new Queue(queueName, true);  // durable=true로 설정하여 재시작 시에도 큐 유지
    }

    @Bean
    public TopicExchange alarmExchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Binding alarmBinding() {
        return BindingBuilder
                .bind(alarmQueue())
                .to(alarmExchange())
                .with(routingKey);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        return rabbitTemplate;
    }
}