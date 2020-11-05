package com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven;

import org.junit.jupiter.api.DisplayName;
import testexecution.annotations.IssueIdAnnotation;
import testexecution.JiraTestExecutionListener;
import testexecution.annotations.TagsAnnotation;
import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.model.Course;
import com.in28minutes.fullstack.springboot.react.maven.crud.springbootreactcrudfullstackwithmaven.service.CoursesHardcodedService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@TestExecutionListeners(
		value = { JiraTestExecutionListener.class },
		mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@ContextConfiguration(classes = CoursesHardcodedService.class)
@DisplayName("Test suite more descriptive title")
public class SpringBootReactCrudFullStackWithMavenApplicationTests {

	@Test
	@IssueIdAnnotation("some Jira test IssueID")
	@TagsAnnotation({"tag 1", "tag2"} )
	@DisplayName("Test more descriptive title")
	public void test1() {
		CoursesHardcodedService service = new CoursesHardcodedService();
		int notAlreadyPresentCourseID = 99;
		String userName = "gorru";
		String description = "some description";
		Course course = new Course(notAlreadyPresentCourseID, userName, description);

		service.save(course);
		assertEquals(6, service.findAll().size());
	}

	@Test
	@IssueIdAnnotation("some Jira test IssueID")
	@TagsAnnotation({"tag 1", "tag2"} )
	@DisplayName("Test more descriptive title")
	public void test2() {
		CoursesHardcodedService service = new CoursesHardcodedService();
		int notAlreadyPresentCourseID = 99;
		String userName = "gorru";
		String description = "some description";
		Course course = new Course(notAlreadyPresentCourseID, userName, description);

		service.save(course);
		assertEquals(6, service.findAll().size());
	}

}
