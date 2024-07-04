---
slug: spring-inject-collections-with-qualifier 
title: Spring 中使用 @Qualifier 分组依赖注入集合类
authors: [jcyuyi]
tags: [java]
---

使用 Spring 的集合类依赖注入时，有时会需要对多个相同类型的 Bean 进行分组。
可以使用 @Qualifier 或者自定义 Qualifier Annotation 来实现。

## @Qualifier

```java
@Configuration
public class QualifiedBeansConfig {
    private static final Logger log = LoggerFactory.getLogger(QualifiedBeansConfig.class);

    public static final String MY_QUALIFIER_A = "MY_QUALIFIER_A";
    public static final String MY_QUALIFIER_B = "MY_QUALIFIER_B";

    @Bean
    @Qualifier(MY_QUALIFIER_A)
    public MyBean myBean1() {
        return new MyBean("1");
    }

    @Bean
    @Qualifier(MY_QUALIFIER_A)
    public MyBean myBean2() {
        return new MyBean("2");
    }

    @Bean
    @Qualifier(MY_QUALIFIER_B)
    public MyBean myBean3() {
        return new MyBean("3");
    }

    @Component
    public static class BeanCollections {
        public BeanCollections(final List<MyBean> myBeansList,
                        @Qualifier(MY_QUALIFIER_A) final Set<MyBean> myBeansSet,
                        @Qualifier(MY_QUALIFIER_B) final Map<String, MyBean> myBeansMap
        ) {
            log.info("myBeansList: {}", myBeansList);
            log.info("myBeansSet: {}", myBeansSet);
            log.info("myBeansMap: {}", myBeansMap);
        }
    }
}
```

输出：

```
...   : myBeansList: [MyBean[key=1], MyBean[key=2], MyBean[key=3]]
...   : myBeansSet: [MyBean[key=1], MyBean[key=2]]
...   : myBeansMap: {myBean3=MyBean[key=3]}
```

## 自定义 Qualifier Annotation

另一种写法是使用自定义 Qualifier Annotation：

```java
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface QualifierA {
}

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface QualifierB {
}
```

将 

- `@Qualifier(MY_QUALIFIER_A)` 替换成 `@QualifierA`
- `@Qualifier(MY_QUALIFIER_B)` 替换成 `@QualifierB`

即可达到同样的效果。
