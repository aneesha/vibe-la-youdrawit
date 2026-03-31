Main Specifications

- This is a new type of Learning Analytics interactive. It is not a dashboard but rather a learning activity designed to use Belief Driven Visualisation to Support Self Regulated Learning. A common type of belief driven visualisation is You Draw It, which was first used on the New York Times website. User are show the start of a series and then asked to draw the rest, before they are then shown the accurate line chart. It can also be used with bar charts. Your role is to make a a multiple step wizard that presents a student with a series of You Draw It charts and then gets them to reflect of differences.
- You should use React and a good CSS Framework for client side. The backend just needs an API that can load and filter the data and make LLM calls and can be in Python. There are You Draw It Libraries available eg https://github.com/EE2dev/you-draw-it but you need to test if it works or not as it is a few years old. 
- The data for the dashboard is in the @data folder. These are the main csv files.
    - Course Enrolment: enrolled_students.csv
    This has 30 students with unique student usernames, first name, last name, degree program.

    - Course details: course_details.csv
    Just 1 entry with the course name - Web Information Systems and a Code WIS2002, start date and end date and no weeks which is 13 the 

    - Student GradeBook: gradebook.csv
    Grades for each of the students from enrolled_students.csv. There are columns from weekly activities from Week 2 to Week 8. There should be 3 assessment items a Design Document, Web Project and a Code Review. Not all students do all the assessment items. The exam should be blank as it is not yet completed. Weekly activities should have a grade out of 5. 

    - Applied Class Completions: appliedclassstats.csv
    1 or 0 to whether the student completed the applied class in each week. applied classes run from week 2 to 12.

    - Weekly LMS access: access.csv
    Weekly unique clicks per student on coursework each week.

- You should merge all the data so you have just 1 file to deal with for filtering. You should add a dummy email address for each student.

- The interactive wizard should allow for the username of the student to be changed in the url. This is just for testing in the prototype stage. 
- The wizard should explain the activity. Students should not be able to move to the next screen until they complete the You Draw It activity.
- Wizard Screen 1: Unique Course Material Access
This would be a You Draw It for unique access to course materials timeseries. Show first 2 weeks and then the student should draw the rest. Provide some feedback based on match to the accurate line that you then display. Ask a reflective questions and display the next button.
- Wizard Screen 2: Completion of Applied Classes and Weekly Activities
Here use a bar chart to get the student to indicate how many Applied Classes and Weekly Activities they completed.
- Wizard End Screen
Thanks the student and ask them to reflect on how they regulate their learning. Briefly explain the importance of this. 

