package test.service

import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.model.Course
import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.service.CoursesHardcodedService
import spock.lang.Issue
import spock.lang.Specification
import test.TestInfo

@Issue('Some test suite Jira issue id')
class CoursesHardcodedServicePassSpec extends Specification {
    void setup() {
        //reportHeader { ["some tag" , "some other tag"] }
    }

    def setupSpec() {

        reportHeader new TestInfo(blockName: 'given', tags: [1:"some tag 1", 2: "some tag 2"] )
    }

    void cleanup() {
    }

    @Issue('Some test Jira issue id')
    def "When there are N courses saving a new course not altrady present should increase courses count by 1"() {

        given: "there are already 4 courses and we want add a course with id not already present"
        //reportHeader { ["some tag" , "some other tag"] }
        reportInfo "some test comment"
        and: "some other given"
        and: "some other given too"

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
