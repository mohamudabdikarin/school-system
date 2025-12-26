package com.fullstack.schoolmanagement;

import com.fullstack.schoolmanagement.entity.*;
import com.fullstack.schoolmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ClassRepository classRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private AcademicSessionRepository academicSessionRepository;
    @Autowired
    private ExamResultRepository examResultRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private PeriodRepository periodRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (userRepository.count() > 0) {
            System.out.println("Database already contains data. Skipping seed.");
            return;
        }

        System.out.println("Starting database seeding...");

        // 1. Create Academic Sessions
        AcademicSession session2023 = createAcademicSession("2023-2024", LocalDate.of(2023, 9, 1), LocalDate.of(2024, 6, 30), false);
        AcademicSession session2024 = createAcademicSession("2024-2025", LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30), true);

        // 2. Create Admin Users
        createAdmin("ADM-1", "admin@school.com", "Admin", "System");

        // 3. Create Classes
        SchoolClass class1A = createClass("Grade 1-A");
        SchoolClass class2A = createClass("Grade 2-A");
        SchoolClass class3A = createClass("Grade 3-A");
        SchoolClass class4A = createClass("Grade 4-A");
        SchoolClass class5A = createClass("Grade 5-A");

        // 4. Create Courses
        Course math = createCourse("MATH101", "Mathematics", "Basic mathematics including arithmetic and algebra");
        Course english = createCourse("ENG101", "English Language", "English grammar, reading, and writing");
        Course science = createCourse("SCI101", "Science", "General science covering physics, chemistry, and biology");
        Course history = createCourse("HIST101", "History", "World and national history");
        Course geography = createCourse("GEO101", "Geography", "Physical and human geography");
        Course art = createCourse("ART101", "Art & Craft", "Creative arts and crafts");
        Course pe = createCourse("PE101", "Physical Education", "Sports and physical fitness");
        Course computer = createCourse("CS101", "Computer Science", "Basic computer skills and programming");

        // 5. Create Teachers
        Teacher teacher1 = createTeacher("TCH-1", "john.smith@school.com", "John", "Smith", 
            "Mathematics", "Male", "M.Sc. Mathematics", 8, "123-456-7890", "123 Main St");
        Teacher teacher2 = createTeacher("TCH-2", "sarah.johnson@school.com", "Sarah", "Johnson", 
            "English", "Female", "M.A. English Literature", 6, "123-456-7891", "456 Oak Ave");
        Teacher teacher3 = createTeacher("TCH-3", "michael.brown@school.com", "Michael", "Brown", 
            "Science", "Male", "M.Sc. Physics", 10, "123-456-7892", "789 Pine Rd");
        Teacher teacher4 = createTeacher("TCH-4", "emily.davis@school.com", "Emily", "Davis", 
            "History", "Female", "M.A. History", 5, "123-456-7893", "321 Elm St");
        Teacher teacher5 = createTeacher("TCH-5", "david.wilson@school.com", "David", "Wilson", 
            "Computer Science", "Male", "M.Tech. Computer Science", 7, "123-456-7894", "654 Maple Dr");

        // 6. Assign courses to teachers
        math.setTeacher(teacher1);
        english.setTeacher(teacher2);
        science.setTeacher(teacher3);
        history.setTeacher(teacher4);
        geography.setTeacher(teacher4);
        art.setTeacher(teacher2);
        pe.setTeacher(teacher3);
        computer.setTeacher(teacher5);
        courseRepository.save(math);
        courseRepository.save(english);
        courseRepository.save(science);
        courseRepository.save(history);
        courseRepository.save(geography);
        courseRepository.save(art);
        courseRepository.save(pe);
        courseRepository.save(computer);

        // 7. Assign courses to classes
        assignCoursesToClass(class1A, math, english, science, art, pe);
        assignCoursesToClass(class2A, math, english, science, history, art, pe);
        assignCoursesToClass(class3A, math, english, science, history, geography, art, pe);
        assignCoursesToClass(class4A, math, english, science, history, geography, computer, pe);
        assignCoursesToClass(class5A, math, english, science, history, geography, computer, art, pe);

        // 8. Assign teachers to classes
        assignTeachersToClass(class1A, teacher1, teacher2, teacher3);
        assignTeachersToClass(class2A, teacher1, teacher2, teacher3, teacher4);
        assignTeachersToClass(class3A, teacher1, teacher2, teacher3, teacher4);
        assignTeachersToClass(class4A, teacher1, teacher2, teacher3, teacher4, teacher5);
        assignTeachersToClass(class5A, teacher1, teacher2, teacher3, teacher4, teacher5);

        // 9. Create Periods for each class
        createPeriodsForClass(class1A, math, english, science, art, pe);
        createPeriodsForClass(class5A, math, english, science, history, computer);

        // 10. Create Students
        Student student1 = createStudent("STD-1", "emma.wilson@student.com", "Emma", "Wilson", 
            "Female", "2017-03-15", "2023-09-01", "555-111-0001", "100 Student Lane", class1A, session2024);
        Student student2 = createStudent("STD-2", "liam.anderson@student.com", "Liam", "Anderson", 
            "Male", "2017-05-20", "2023-09-01", "555-111-0002", "101 Student Lane", class1A, session2024);
        Student student3 = createStudent("STD-3", "olivia.thomas@student.com", "Olivia", "Thomas", 
            "Female", "2016-08-10", "2022-09-01", "555-111-0003", "102 Student Lane", class2A, session2024);
        Student student4 = createStudent("STD-4", "noah.jackson@student.com", "Noah", "Jackson", 
            "Male", "2016-11-25", "2022-09-01", "555-111-0004", "103 Student Lane", class2A, session2024);
        Student student5 = createStudent("STD-5", "ava.white@student.com", "Ava", "White", 
            "Female", "2015-02-14", "2021-09-01", "555-111-0005", "104 Student Lane", class3A, session2024);
        Student student6 = createStudent("STD-6", "ethan.harris@student.com", "Ethan", "Harris", 
            "Male", "2015-07-30", "2021-09-01", "555-111-0006", "105 Student Lane", class3A, session2024);
        Student student7 = createStudent("STD-7", "sophia.martin@student.com", "Sophia", "Martin", 
            "Female", "2014-04-18", "2020-09-01", "555-111-0007", "106 Student Lane", class4A, session2024);
        Student student8 = createStudent("STD-8", "mason.thompson@student.com", "Mason", "Thompson", 
            "Male", "2014-09-22", "2020-09-01", "555-111-0008", "107 Student Lane", class4A, session2024);
        Student student9 = createStudent("STD-9", "isabella.garcia@student.com", "Isabella", "Garcia", 
            "Female", "2013-01-05", "2019-09-01", "555-111-0009", "108 Student Lane", class5A, session2024);
        Student student10 = createStudent("STD-10", "james.martinez@student.com", "James", "Martinez", 
            "Male", "2013-06-12", "2019-09-01", "555-111-0010", "109 Student Lane", class5A, session2024);

        // 11. Create Exam Results
        createExamResults(student1, class1A, math, english, science);
        createExamResults(student2, class1A, math, english, science);
        createExamResults(student3, class2A, math, english, science, history);
        createExamResults(student4, class2A, math, english, science, history);
        createExamResults(student5, class3A, math, english, science, history, geography);
        createExamResults(student6, class3A, math, english, science, history, geography);
        createExamResults(student7, class4A, math, english, science, history, computer);
        createExamResults(student8, class4A, math, english, science, history, computer);
        createExamResults(student9, class5A, math, english, science, history, computer);
        createExamResults(student10, class5A, math, english, science, history, computer);

        System.out.println("Database seeding completed successfully!");
        System.out.println("===========================================");
        System.out.println("Login Credentials (All passwords: 1234):");
        System.out.println("Admin: ADM-1");
        System.out.println("Teachers: TCH-1 to TCH-5");
        System.out.println("Students: STD-1 to STD-10");
        System.out.println("===========================================");
    }

    private AcademicSession createAcademicSession(String name, LocalDate startDate, LocalDate endDate, boolean current) {
        AcademicSession session = new AcademicSession();
        session.setName(name);
        session.setStartDate(startDate);
        session.setEndDate(endDate);
        session.setCurrentSession(current);
        return academicSessionRepository.save(session);
    }

    private void createAdmin(String userId, String email, String firstName, String lastName) {
        User user = new User();
        user.setUserId(userId);
        user.setPassword(passwordEncoder.encode("1234"));
        user.setRole("ROLE_ADMIN");
        user.setActive(true);
        user.setEmail(email);
        userRepository.save(user);
    }

    private SchoolClass createClass(String name) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(name);
        schoolClass.setTeachers(new HashSet<>());
        schoolClass.setCourses(new HashSet<>());
        return classRepository.save(schoolClass);
    }

    private Course createCourse(String code, String name, String description) {
        Course course = new Course();
        course.setCourseCode(code);
        course.setCourseName(name);
        course.setDescription(description);
        return courseRepository.save(course);
    }

    private Teacher createTeacher(String userId, String email, String firstName, String lastName,
                                   String specialization, String gender, String qualification,
                                   int experience, String phone, String address) {
        User user = new User();
        user.setUserId(userId);
        user.setPassword(passwordEncoder.encode("1234"));
        user.setRole("ROLE_TEACHER");
        user.setActive(true);
        user.setEmail(email);

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);
        teacher.setEmail(email);
        teacher.setSpecialization(specialization);
        teacher.setGender(gender);
        teacher.setQualification(qualification);
        teacher.setExperience(experience);
        teacher.setPhone(phone);
        teacher.setAddress(address);
        teacher.setHireDate(LocalDate.now().minusYears(experience));
        return teacherRepository.save(teacher);
    }

    private Student createStudent(String userId, String email, String firstName, String lastName,
                                   String gender, String dob, String admissionDate, String phone,
                                   String address, SchoolClass schoolClass, AcademicSession session) {
        User user = new User();
        user.setUserId(userId);
        user.setPassword(passwordEncoder.encode("1234"));
        user.setRole("ROLE_STUDENT");
        user.setActive(true);
        user.setEmail(email);

        Student student = new Student();
        student.setUser(user);
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setGender(gender);
        student.setDateOfBirth(LocalDate.parse(dob));
        student.setAdmissionDate(LocalDate.parse(admissionDate));
        student.setPhone(phone);
        student.setAddress(address);
        student.setActive(true);
        student.setSchoolClass(schoolClass);
        student.setSession(session);
        return studentRepository.save(student);
    }

    private void assignCoursesToClass(SchoolClass schoolClass, Course... courses) {
        Set<Course> courseSet = new HashSet<>();
        for (Course course : courses) {
            courseSet.add(course);
        }
        schoolClass.setCourses(courseSet);
        classRepository.save(schoolClass);
    }

    private void assignTeachersToClass(SchoolClass schoolClass, Teacher... teachers) {
        Set<Teacher> teacherSet = new HashSet<>();
        for (Teacher teacher : teachers) {
            teacherSet.add(teacher);
        }
        schoolClass.setTeachers(teacherSet);
        classRepository.save(schoolClass);
    }

    private void createExamResults(Student student, SchoolClass schoolClass, Course... courses) {
        String[] examTypes = {"Midterm", "Final"};
        LocalDate[] examDates = {LocalDate.of(2024, 11, 15), LocalDate.of(2025, 5, 20)};

        for (int i = 0; i < examTypes.length; i++) {
            for (Course course : courses) {
                ExamResult result = new ExamResult();
                result.setStudent(student);
                result.setSchoolClass(schoolClass);
                result.setCourse(course);
                result.setExamType(examTypes[i]);
                result.setExamDate(examDates[i]);

                // Generate random marks between 60-100
                double marks = 60 + (Math.random() * 40);
                result.setMarksObtained(BigDecimal.valueOf(Math.round(marks * 100.0) / 100.0));

                // Assign grade based on marks
                String grade;
                String remarks;
                if (marks >= 90) {
                    grade = "A+";
                    remarks = "Excellent performance";
                } else if (marks >= 80) {
                    grade = "A";
                    remarks = "Very good performance";
                } else if (marks >= 70) {
                    grade = "B";
                    remarks = "Good performance";
                } else if (marks >= 60) {
                    grade = "C";
                    remarks = "Satisfactory performance";
                } else {
                    grade = "D";
                    remarks = "Needs improvement";
                }

                result.setGrade(grade);
                result.setRemarks(remarks);
                examResultRepository.save(result);
            }
        }
    }

    private void createPeriodsForClass(SchoolClass schoolClass, Course... courses) {
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"};
        String[] times = {"08:00", "09:00", "10:00", "11:00", "13:00", "14:00"};
        
        for (String day : days) {
            int periodNum = 1;
            for (int i = 0; i < Math.min(courses.length, times.length - 1); i++) {
                Period period = new Period();
                period.setSchoolClass(schoolClass);
                period.setCourse(courses[i]);
                period.setStartTime(java.time.LocalTime.parse(times[i]));
                period.setEndTime(java.time.LocalTime.parse(times[i + 1]));
                period.setPeriodNumber(periodNum++);
                period.setDayOfWeek(day);
                periodRepository.save(period);
            }
        }
    }
} 