package com.c202.lucky;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableDiscoveryClient
@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.c202.*"})
public class LuckyServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuckyServiceApplication.class, args);
	}

}
