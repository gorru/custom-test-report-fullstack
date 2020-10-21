package test.service

import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.model.Course
import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.service.CoursesHardcodedService
import spock.lang.Issue
import test.TestBaseSpec
import test.TestInfo

@Issue('Some Jira issue id')
class CoursesHardcodedServiceFailSpec extends TestBaseSpec {
    void setup() {
    }

    def setupSpec() {
        reportHeader new TestInfo(blockName: 'given', tags: [1:"some tag 1", 2: "some tag 2"] )
    }

    void cleanup() {
    }

    def "When there are N courses saving a new course not altrady present should increase courses count by 1"() {

        given: """
            * there are already 4 courses 
            * and we want add a course with id not already present
        """

        CoursesHardcodedService service = new CoursesHardcodedService();
        def notAlreadyPresentCourseID = 99
        def userName = "gorru"
        def description = "some description"
        Course course = new Course(notAlreadyPresentCourseID, userName, description);

        when: "saving the course"
        service.save(course);

        then: "the courses count should be 5 (5 + 1)"
        service.findAll().size().equals(6);
    }

    def "DeleteById"() {
    }

    def "FindById"() {
    }
}
