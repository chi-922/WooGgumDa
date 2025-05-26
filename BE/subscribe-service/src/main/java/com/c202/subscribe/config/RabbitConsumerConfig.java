package com.c202.subscribe.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConsumerConfig {

    @Bean
    public Exchange userExchange() {
        return ExchangeBuilder.topicExchange("user.event.exchange").durable(true).build();
    }

    @Bean
    public Queue userWithdrawnQueue() {
        return QueueBuilder.durable("user.withdrawn.queue").build();
    }

    @Bean
    public Binding userWithdrawnBinding() {
        return BindingBuilder.bind(userWithdrawnQueue())
                .to(userExchange())
                .with("user.withdrawn")
                .noargs();
    }
}
