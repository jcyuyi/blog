---
slug: spring-inject-collections-with-qualifier 
title: Use @Qualifier to inject collections groups in Spring
authors: [jcyuyi]
tags: [java]
---

When using collection dependency injection in Spring, sometimes it's necessary to group multiple beans of the same type. 
This can be achieved by using either @Qualifier or custom qualifier annotations.

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

Output

```
...   : myBeansList: [MyBean[key=1], MyBean[key=2], MyBean[key=3]]
...   : myBeansSet: [MyBean[key=1], MyBean[key=2]]
...   : myBeansMap: {myBean3=MyBean[key=3]}
```

## Custom Qualifier Annotation

Another approach is to use Custom Qualifier Annotation：

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

Replace 

- `@Qualifier(MY_QUALIFIER_A)` to `@QualifierA`
- `@Qualifier(MY_QUALIFIER_B)` to `@QualifierB`

to achieve the same goal.
