package testexecution;

import org.eaxy.Document;
import org.eaxy.Element;
import org.eaxy.Xml;
import org.junit.jupiter.api.DisplayName;
import org.springframework.test.context.TestExecutionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.test.context.TestContext;
import testexecution.annotations.IssueIdAnnotation;
import testexecution.annotations.TagsAnnotation;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Date;

public class JiraTestExecutionListener implements TestExecutionListener, Ordered {
    private static final Logger logger = LoggerFactory.getLogger(JiraTestExecutionListener.class);

    Document doc;
    Writer writer;
    Element suite;
    Element test;

    String testStartTime;
    String testEndTime;

    public void beforeTestClass(TestContext testContext) throws Exception {
        logger.info("beforeTestClass : {}", testContext.getTestClass());

        doc = Xml.doc(Xml.el("empty"));
        doc.setVersion("1.1");
        doc.setEncoding("iso-8859-1");

        Date date = new Date();
        String stringDate = getCurrentTimeAsFormattedString(date);

        String os = System.getProperties().getProperty("os.name");

        Element robot = Xml.el("robot").attr("generated", stringDate).attr("generator", os);
        suite = Xml.el("suite");
        robot.add(suite);

        DisplayName displayNameAnnotation = testContext.getTestClass().getAnnotation(DisplayName.class);
        if(displayNameAnnotation != null) {
            String displayName = displayNameAnnotation.value();
            suite.attr("name", displayName);
        }

        doc.setRootElement(robot);
        File targetDir = new File(JiraTestExecutionListener.class.getProtectionDomain().getCodeSource().getLocation().getPath()).getParentFile();
        String classShortName = testContext.getTestClass().getName().replace( testContext.getTestClass().getPackage().getName(), "").replace(".", "");
        String fileName = String.format("%s/testReport%s.xml", targetDir.toString(), classShortName);
        File file = new File(fileName);
        if (!file.exists()) {
            file.createNewFile();
        }
        writer = new BufferedWriter(new FileWriter(file));

    }

    private String getCurrentTimeAsFormattedString(Date date) {
        SimpleDateFormat DateFor = new SimpleDateFormat("yyyyMMdd-HH:mm:ss.SS");
        String stringDate= DateFor.format(date);
        return stringDate;
    }

    public void prepareTestInstance(TestContext testContext) throws Exception {
        logger.info("prepareTestInstance : {}", testContext.getTestClass());
    };

    public void beforeTestMethod(TestContext testContext) throws Exception {
        logger.info("beforeTestMethod : {}", testContext.getTestMethod());
        test = Xml.el("test");
        IssueIdAnnotation issueIdAnnotation = testContext.getTestMethod().getAnnotation(IssueIdAnnotation.class);
        if(issueIdAnnotation != null) {
            String testID = issueIdAnnotation.value();
            test.attr("id", testID);
        }
        String testName = testContext.getTestMethod().getName();

        DisplayName displayNameAnnotation = testContext.getTestMethod().getAnnotation(DisplayName.class);
        String displayName = "";
        if(displayNameAnnotation != null) {
            displayName = displayNameAnnotation.value();
        }

        test.attr("name", String.format("%s (%s)", displayName, testName));
        suite.add(test);
        Date date = new Date();
        String stringDate = getCurrentTimeAsFormattedString(date);
        testStartTime = stringDate;

        TagsAnnotation tagsAnnotation = testContext.getTestMethod().getAnnotation(TagsAnnotation.class);
        if(tagsAnnotation != null) {
            Element tagsElement = Xml.el("tags");
            test.add(tagsElement);
            String[] tags = tagsAnnotation.value();
            for (String tag: tags) {
                Element tagElement = Xml.el("tag", tag);
                tagsElement.add(tagElement);
            }
        }
    };

    public void afterTestMethod(TestContext testContext) throws Exception {
        logger.info("afterTestMethod : {}", testContext.getTestMethod());
        Throwable testException = testContext.getTestException();
        String testResult = "PASS";
        if(testException != null){
            testResult = "FAIL";
        }
        Element status = Xml.el("status");
        status.attr("status", testResult);
        status.attr("starttime", testStartTime);
        Date date = new Date();
        String stringDate = getCurrentTimeAsFormattedString(date);
        testEndTime = stringDate;
        status.attr("endtime", testEndTime);

        test.add(status);
    };

    public void afterTestClass(TestContext testContext) throws Exception {
        logger.info("afterTestClass : {}", testContext.getTestClass());

        doc.writeTo(writer);
        writer.close();
    }

    @Override
    public int getOrder() {
        return Integer.MAX_VALUE;
    };
}
