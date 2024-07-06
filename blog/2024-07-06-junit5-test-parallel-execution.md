---
slug: junit5-test-parallel-execution
title: JUnit5 并行测试
authors: [jcyuyi]
tags: [java]
---

## 准备测试样例

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

### 默认执行结果

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

## 启用 JUnit5 并行测试

在 `gradle.build` 中添加 `junit.jupiter.execution.parallel` System Property：

```groovy
test {
    //...
    systemProperty("junit.jupiter.execution.parallel.enabled", true)
    systemProperty("junit.jupiter.execution.parallel.mode.default", "concurrent")
    systemProperty("junit.jupiter.execution.parallel.mode.classes.default", "concurrent")
}
```

### 执行结果

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

可以看到，测试 Class 并行执行，并且每个 Class 中的 `@Test` 方法也同样并行执行了。

## 仅并行测试 Class

可以仅并行测试 Class，每个 Class 中的 `@Test` 方法保留单线程顺序执行。

在 `gradle.build` 中修改

```groovy
test {
    //...
    systemProperty("junit.jupiter.execution.parallel.mode.default", "same_thread")
    systemProperty("junit.jupiter.execution.parallel.mode.classes.default", "concurrent")
}
```

### 执行结果

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

可以看到，测试 Class 并行执行，同时 A1 A2 在 worker-3 中，B1 B2 在 worker-1 中分别单线程顺序执行。

## 设置固定值的并行度

默认 strategy 会根据 CPU 内核数量调整并行度。

在 `gradle.build` 中添加

```groovy
test {
    //...
    systemProperty("junit.jupiter.execution.parallel.config.strategy", "fixed")
    systemProperty("junit.jupiter.execution.parallel.config.fixed.parallelism", 4)
}
```

可将并行度设置为固定值。

## 常见多线程环境测试问题

有时会遇到执行单独一个测试没问题，所有测试同时执行报错的情况。可以将 `parallelism` 设为 1 排查多线程环境问题。

常见的多线程环境测试问题是共享资源导致的，包括：

- 共享同一个数据库，使用同名的 Table，View，Lock 等等
- 共享同一个 static 变量，共享变量非线程安全
- 共享同一个目录/文件

### 常见解决方案

- 不同测试类使用不同的数据库，如果需要共享则给使用的资源添加前后缀名称
- 使用 [ResourceLock](https://junit.org/junit5/docs/snapshot/api/org.junit.jupiter.api/org/junit/jupiter/api/parallel/ResourceLock.html) 给资源冲突的测试加锁
- 尽量减少 static 变量的使用，使用线程安全的共享变量/单例设计模式，使用 ThreadLocal
- 每个测试使用单独的 [`@TempDir`](https://junit.org/junit5/docs/snapshot/user-guide/#writing-tests-built-in-extensions-TempDirectory)

## 参考

- [JUnit 5 User Guide/Parallel Execution](https://junit.org/junit5/docs/snapshot/user-guide/#writing-tests-parallel-execution)
