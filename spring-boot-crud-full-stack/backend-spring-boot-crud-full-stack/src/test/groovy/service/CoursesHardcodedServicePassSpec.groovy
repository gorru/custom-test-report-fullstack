package com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.service

import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.model.Course
import spock.lang.Specification

class CoursesHardcodedServicePassSpec extends Specification {
    void setup() {
    }

    def setupSpec() {
        reportHeader "Some comment"
    }

    void cleanup() {
    }

    def "When there are N courses saving a new course not altrady present should increase courses count by 1"() {

        given: "given there are already 4 courses and we want add a course with id not already present"
        reportInfo "some test comment"

        CoursesHardcodedService service = new CoursesHardcodedService();
        def notAlreadyPresentCourseID = 99
        def userName = "gorru"
        def description = "some description"
        Course course = new Course(notAlreadyPresentCourseID, userName, description);

        when: "saving the course"
        service.save(course);

        then: "the courses count should be 5 (5 + 1)"
        service.findAll().size().equals(5);
    }

    def "DeleteById"() {
    }

    def "FindById"() {
    }
}
