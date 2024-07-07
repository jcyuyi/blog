---
slug: junit5-test-parallel-execution
title: JUnit 5 parallel testing
authors: [jcyuyi]
tags: [java]
---

## Prepare test cases

```java
public class TestClassBase {
    private static final Logger log = LoggerFactory.getLogger(TestClassBase.class);

    @BeforeEach
    public void beforeEach(final TestInfo testInfo) {
        log.info("Running {} in {}", testInfo.getDisplayName(), Thread.currentThread().getName());
    }

    @AfterEach
    public void afterEach(final TestInfo testInfo) {
        log.info("Finished {} in {}", testInfo.getDisplayName(), Thread.currentThread().getName());
    }
}

public class TestClassA extends TestClassBase {
    @ParameterizedTest(name = "test: {arguments}")
    @ValueSource(strings = { "A1", "A2" })
    public void timeConsumingTest(final String name) throws Exception {
        Thread.sleep(Duration.ofSeconds(1).toMillis());
    }
}

public class TestClassB extends TestClassBase {
    @ParameterizedTest(name = "test: {arguments}")
    @ValueSource(strings = { "B1", "B2" })
    public void timeConsumingTest(final String name) throws Exception {
        Thread.sleep(Duration.ofSeconds(1).toMillis());
    }
}
```

### Default output

```
[Test worker] INFO TestClassBase - Running test: A1 in Test worker
[Test worker] INFO TestClassBase - Finished test: A1 in Test worker
[Test worker] INFO TestClassBase - Running test: A2 in Test worker
[Test worker] INFO TestClassBase - Finished test: A2 in Test worker
[Test worker] INFO TestClassBase - Running test: B1 in Test worker
[Test worker] INFO TestClassBase - Finished test: B1 in Test worker
[Test worker] INFO TestClassBase - Running test: B2 in Test worker
[Test worker] INFO TestClassBase - Finished test: B2 in Test worker
```

## Enable JUnit 5 parallel testing

Add `junit.jupiter.execution.parallel` System Properties to `gradle.build`:

```groovy
test {
    //...
    systemProperty("junit.jupiter.execution.parallel.enabled", true)
    systemProperty("junit.jupiter.execution.parallel.mode.default", "concurrent")
    systemProperty("junit.jupiter.execution.parallel.mode.classes.default", "concurrent")
}
```

### Output

```
[ForkJoinPool-1-worker-5] INFO TestClassBase - Running test: A2 in ForkJoinPool-1-worker-5
[ForkJoinPool-1-worker-2] INFO TestClassBase - Running test: A1 in ForkJoinPool-1-worker-2
[ForkJoinPool-1-worker-6] INFO TestClassBase - Running test: B2 in ForkJoinPool-1-worker-6
[ForkJoinPool-1-worker-4] INFO TestClassBase - Running test: B1 in ForkJoinPool-1-worker-4
[ForkJoinPool-1-worker-5] INFO TestClassBase - Finished test: A2 in ForkJoinPool-1-worker-5
[ForkJoinPool-1-worker-6] INFO TestClassBase - Finished test: B2 in ForkJoinPool-1-worker-6
[ForkJoinPool-1-worker-2] INFO TestClassBase - Finished test: A1 in ForkJoinPool-1-worker-2
[ForkJoinPool-1-worker-4] INFO TestClassBase - Finished test: B1 in ForkJoinPool-1-worker-4
```

As you can see, the test classes are executed in parallel, and each `@Test` method within each class is also executed concurrently.

## Class-level only parallel testing

You can parallelize the testing of classes while keeping the execution of `@Test` methods within each class in a single-threaded, sequential order.

Modify `gradle.build`:

```groovy
test {
    //...
    systemProperty("junit.jupiter.execution.parallel.mode.default", "same_thread")
    systemProperty("junit.jupiter.execution.parallel.mode.classes.default", "concurrent")
}
```

### Output

```
[ForkJoinPool-1-worker-3] INFO TestClassBase - Running test: A1 in ForkJoinPool-1-worker-3
[ForkJoinPool-1-worker-1] INFO TestClassBase - Running test: B1 in ForkJoinPool-1-worker-1
[ForkJoinPool-1-worker-3] INFO TestClassBase - Finished test: A1 in ForkJoinPool-1-worker-3
[ForkJoinPool-1-worker-1] INFO TestClassBase - Finished test: B1 in ForkJoinPool-1-worker-1
[ForkJoinPool-1-worker-1] INFO TestClassBase - Running test: B2 in ForkJoinPool-1-worker-1
[ForkJoinPool-1-worker-3] INFO TestClassBase - Running test: A2 in ForkJoinPool-1-worker-3
[ForkJoinPool-1-worker-1] INFO TestClassBase - Finished test: B2 in ForkJoinPool-1-worker-1
[ForkJoinPool-1-worker-3] INFO TestClassBase - Finished test: A2 in ForkJoinPool-1-worker-3
```

You can see that the test classes are executed in parallel. A1 and A2 run sequentially in worker-3, while B1 and B2 run sequentially in worker-1.

## Set a Fixed Parallelism Value

By default, the strategy adjusts parallelism based on the number of CPU cores.

Add the following System Properties to `gradle.build`:

```groovy
test {
    //...
    systemProperty("junit.jupiter.execution.parallel.config.strategy", "fixed")
    systemProperty("junit.jupiter.execution.parallel.config.fixed.parallelism", 4)
}
```

to set the parallelism to a fixed value.

## Common Issues in Multi-threaded Environment Testing

Sometimes, a single test runs fine, but errors occur when all tests run simultaneously. Setting parallelism to 1 can help troubleshoot multi-threading issues.

Common multi-threaded environment testing problems include shared resources, such as:

- Sharing the same database with tables, views, locks, etc.
- Sharing the same static variable that isn't thread-safe
- Sharing the same directory/file

### Common Solutions

- Different test classes should use different databases. If sharing is necessary, add prefixes or suffixes to the resource names being used.
- Use [ResourceLock](https://junit.org/junit5/docs/snapshot/api/org.junit.jupiter.api/org/junit/jupiter/api/parallel/ResourceLock.html) to add locks to tests that have resource conflicts.
- Minimize the use of static variables. Instead, use thread-safe shared variables, the singleton design pattern, or ThreadLocal.
- Each test should use its own [`@TempDir`](https://junit.org/junit5/docs/snapshot/user-guide/#writing-tests-built-in-extensions-TempDirectory)

## Reference

- [JUnit 5 User Guide/Parallel Execution](https://junit.org/junit5/docs/snapshot/user-guide/#writing-tests-parallel-execution)
