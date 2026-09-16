package com.rce.complaint_box;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest
public abstract class AbstractIntegrationTest {

    public static final GenericContainer<?> mongo = new GenericContainer<>(DockerImageName.parse("mongo:7"))
            .withExposedPorts(27017);

    static {
        mongo.start();
    }

    @DynamicPropertySource
    static void setMongoProperties(DynamicPropertyRegistry registry) {
        String uri = "mongodb://" + mongo.getHost() + ":" + mongo.getMappedPort(27017) + "/complaint_box_test";
        registry.add("spring.data.mongodb.uri", () -> uri);
    }
}