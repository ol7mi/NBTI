package com.nbti.services;

import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.nbti.dao.AttendanceDAO;
import com.nbti.dao.MembersDAO;
import com.nbti.dao.TeamsDAO;
import com.nbti.dto.AttendanceDTO;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceDAO aDao;
    @Autowired
    private TeamsDAO tDao;
    @Autowired
    private MembersDAO mDao;

    public Map<String, Object> clockIn(String memberId) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        Timestamp clockInDeadline = Timestamp.valueOf(LocalDateTime.now().toLocalDate().atTime(9, 0));
        boolean isLate = now.after(clockInDeadline);

        AttendanceDTO dto = new AttendanceDTO();
        dto.setMember_id(memberId);
        dto.setStart_date(now);
        aDao.insert(dto);
        
        Map<String, Object> result = new HashMap<>();
        result.put("seq", dto.getSeq());
        result.put("start_date", dto.getStart_date());
        result.put("isLate", isLate);

        return result;
    }

    public void clockOut(String memberId, Timestamp endDate) {
        AttendanceDTO currentRecord = aDao.getCurrentStatus(memberId);
        if (currentRecord != null) {
            Timestamp startDate = currentRecord.getStart_date();
            LocalDateTime startDateTime = startDate.toLocalDateTime();
            LocalDateTime endDateTime = endDate.toLocalDateTime();

            // Update end date
            aDao.updateClockOut(currentRecord.getSeq(), endDate);

            // Check for early leave
            if (endDateTime.toLocalTime().isBefore(LocalTime.of(18, 0))) {
                // Handle early leave logic
                
            }
        } else {
            // Handle case where no current record is found
            
        }
    }

    public Map<String, Object> getStatus(String memberId) {
        AttendanceDTO status = aDao.getCurrentStatus(memberId);
        Map<String, Object> result = new HashMap<>();
        if (status != null) {
            result.put("start_date", status.getStart_date());
            result.put("end_date", status.getEnd_date());
            result.put("clockedIn", status.getStart_date() != null);
            result.put("clockedOut", status.getEnd_date() != null);
            if (status.getStart_date() != null) {
                boolean isLate = status.getStart_date().toLocalDateTime().toLocalTime().isAfter(LocalTime.of(9, 0));
                result.put("isLate", isLate);
            } else {
                result.put("isLate", false);
            }
        } else {
            result.put("start_date", null);
            result.put("end_date", null);
            result.put("clockedIn", false);
            result.put("clockedOut", false);
            result.put("isLate", false);
        }
        return result;
    }

    public Map<String, Object> getMonthlyStats(String memberId, int year, int month) {
        List<AttendanceDTO> records = aDao.getMonthlyRecords(memberId, year, month);

        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth());

        int lateCount = 0;
        int absentCount = 0;
        int earlyLeaveCount = 0;
        double totalWorkHours = 0;

        Map<String, Map<String, Object>> dailyStats = new HashMap<>();

        for (AttendanceDTO record : records) {
            Timestamp startDate = record.getStart_date();
            Timestamp endDate = record.getEnd_date();

            if (startDate != null) {
                LocalDateTime startDateTime = startDate.toLocalDateTime();
                LocalDate localDate = startDateTime.toLocalDate();
                String dateString = localDate.toString();

                if (!dailyStats.containsKey(dateString)) {
                    dailyStats.put(dateString, new HashMap<>());
                }

                Map<String, Object> dateStats = dailyStats.get(dateString);
                dateStats.put("startDate", startDate);
                dateStats.put("endDate", endDate);

                if (localDate.isEqual(LocalDate.now()) && endDate == null) {
                    absentCount++;
                    dateStats.put("absent", true);
                } else {
                    dateStats.put("absent", false);
                }

                if (!localDate.isBefore(startOfMonth) && !localDate.isAfter(endOfMonth)) {
                    if (startDateTime.toLocalTime().isAfter(LocalTime.of(9, 0))) {
                        lateCount++;
                        dateStats.put("late", true);
                    } else {
                        dateStats.put("late", false);
                    }

                    if (endDate != null) {
                        LocalDateTime endDateTime = endDate.toLocalDateTime();
                        Duration workDuration = Duration.between(startDateTime, endDateTime);
                        totalWorkHours += workDuration.toHours() + workDuration.toMinutes() / 60.0;

                        if (endDateTime.toLocalTime().isBefore(LocalTime.of(18, 0))) {
                            earlyLeaveCount++;
                            dateStats.put("earlyLeave", true);
                        } else {
                            dateStats.put("earlyLeave", false);
                        }
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("lateCount", lateCount);
        result.put("absentCount", absentCount);
        result.put("earlyLeaveCount", earlyLeaveCount);
        result.put("totalWorkHours", totalWorkHours);
        result.put("dailyStats", dailyStats);

        return result;
    }

    
    
    
    public Map<String, Object> getWeeklyStats(String memberId) {
        List<AttendanceDTO> records = aDao.getWeeklyRecords(memberId);

        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        int lateCount = 0;
        int absentCount = 0;
        int earlyLeaveCount = 0;

        Map<String, Map<String, Object>> dailyStats = new HashMap<>();

        for (AttendanceDTO record : records) {
            Timestamp startDate = record.getStart_date();
            Timestamp endDate = record.getEnd_date();

            if (startDate != null) {
                LocalDateTime startDateTime = startDate.toLocalDateTime();
                LocalDate localDate = startDateTime.toLocalDate();
                String dateString = localDate.toString();

                if (!dailyStats.containsKey(dateString)) {
                    dailyStats.put(dateString, new HashMap<>());
                }

                Map<String, Object> dateStats = dailyStats.get(dateString);
                dateStats.put("startDate", startDate);
                dateStats.put("endDate", endDate);

                if (localDate.isEqual(today) && endDate == null) {
                    absentCount++;
                    dateStats.put("absent", true);
                } else {
                    dateStats.put("absent", false);
                }

                if (startDateTime.toLocalDate().isAfter(startOfWeek.minusDays(1)) && startDateTime.toLocalDate().isBefore(endOfWeek.plusDays(1))) {
                    if (startDateTime.toLocalTime().isAfter(LocalTime.of(9, 0))) {
                        lateCount++;
                        dateStats.put("late", true);
                    } else {
                        dateStats.put("late", false);
                    }

                    if (endDate != null) {
                        LocalDateTime endDateTime = endDate.toLocalDateTime();
                        if (endDateTime.toLocalTime().isBefore(LocalTime.of(18, 0))) {
                            earlyLeaveCount++;
                            dateStats.put("earlyLeave", true);
                        } else {
                            dateStats.put("earlyLeave", false);
                        }
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("lateCount", lateCount);
        result.put("absentCount", absentCount);
        result.put("earlyLeaveCount", earlyLeaveCount);
        result.put("dailyStats", dailyStats);

        return result;
    }
    

    public List<AttendanceDTO> getWeeklyRecordsForAll(LocalDate startOfWeek, LocalDate endOfWeek) {
        return aDao.getWeeklyRecordsForAll(startOfWeek, endOfWeek);
    }
    // 주간 통계 계산
    public Map<String, Map<String, Object>> calculateAllWeeklyStats(List<AttendanceDTO> attendanceRecords) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        Map<String, Map<String, Object>> memberWeeklyStats = new HashMap<>();

        // 각 멤버별 출석 기록을 처리
        for (AttendanceDTO record : attendanceRecords) {
            if (record == null || record.getMember_id() == null) {
                continue; // record 또는 member_id가 null인 경우 건너뛰기
            }

            String memberId = record.getMember_id();
            
            Timestamp startDate = record.getStart_date();
            Timestamp endDate = record.getEnd_date();

            // member_id로부터 이름과 팀 이름을 조회
            Map<String, Object> memberDetails = mDao.memberData(memberId);
            String memberName = (String) memberDetails.getOrDefault("NAME", "이름 없음");
            String teamName = (String) memberDetails.getOrDefault("TEAM_NAME", "팀 이름 없음");

            Map<String, Object> dailyStats = memberWeeklyStats.computeIfAbsent(memberId, k -> new HashMap<>());

            if (startDate == null) {
                // 출근 기록이 없을 경우 기본값 설정
                for (LocalDate date = startOfWeek; !date.isAfter(endOfWeek); date = date.plusDays(1)) {
                    String dateString = date.toString();
                    Map<String, Object> dateStats = new HashMap<>();
                    dateStats.put("startDate", null);
                    dateStats.put("endDate", null);
                    dateStats.put("name", memberName);
                    dateStats.put("team_name", teamName);
                    dateStats.put("absent", true); // 출근 기록이 없는 경우 결근 처리
                    dateStats.put("late", false);
                    dateStats.put("earlyLeave", false);
                    dailyStats.put(dateString, dateStats);
                }
                continue;
            }

            LocalDateTime startDateTime = startDate.toLocalDateTime();
            LocalDate localDate = startDateTime.toLocalDate();
            String dateString = localDate.toString();

            Map<String, Object> dateStats = (Map<String, Object>) dailyStats.computeIfAbsent(dateString, k -> new HashMap<>());

            dateStats.put("startDate", startDate);
            dateStats.put("endDate", endDate);
            dateStats.put("name", memberName);
            dateStats.put("team_name", teamName);

            if (localDate.isEqual(today) && endDate == null) {
                dateStats.put("absent", true);
            } else {
                dateStats.put("absent", false);
            }

            if (!localDate.isBefore(startOfWeek) && !localDate.isAfter(endOfWeek)) {
                if (startDateTime.toLocalTime().isAfter(LocalTime.of(9, 0))) {
                    dateStats.put("late", true);
                } else {
                    dateStats.put("late", false);
                }

                if (endDate != null) {
                    LocalDateTime endDateTime = endDate.toLocalDateTime();
                    if (endDateTime.toLocalTime().isBefore(LocalTime.of(18, 0))) {
                        dateStats.put("earlyLeave", true);
                    } else {
                        dateStats.put("earlyLeave", false);
                    }
                } else {
                    dateStats.put("earlyLeave", false);
                }
            }

            dailyStats.put(dateString, dateStats);
        }

        return memberWeeklyStats;
    }
    public ResponseEntity<Map<String, Object>> getAllWeeklyStats() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate endOfWeek = startOfWeek.plusDays(6);

            List<AttendanceDTO> attendanceRecords = aDao.getWeeklyRecordsForAll(startOfWeek, endOfWeek);
            Map<String, Map<String, Object>> memberWeeklyStats = calculateAllWeeklyStats(attendanceRecords);

            Map<String, Object> response = new HashMap<>();
            response.put("members", memberWeeklyStats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", -2); // Error code for internal server error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
  


    public Map<String, Object> getYearlyStats(String memberId) {
        List<AttendanceDTO> records = aDao.getYearlyRecords(memberId);

        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());
        LocalDate endOfYear = today.with(TemporalAdjusters.lastDayOfYear());

        int lateCount = 0;
        int absentCount = 0;
        int earlyLeaveCount = 0;
        int statsDay = 0;
        double statsHours = 0.0;
        
        for (AttendanceDTO record : records) {
            Timestamp startDate = record.getStart_date();
            Timestamp endDate = record.getEnd_date();
            
            if (startDate != null) {
                LocalDateTime startDateTime = startDate.toLocalDateTime();
                if (!startDateTime.toLocalDate().isBefore(startOfYear) &&
                    !startDateTime.toLocalDate().isAfter(endOfYear)) {

                    // 지각 체크
                    if (startDateTime.toLocalTime().isAfter(LocalTime.of(9, 0))) {
                        lateCount++;
                    }

                    // 조기 퇴근 체크
                    if (endDate != null) {
                        LocalDateTime endDateTime = endDate.toLocalDateTime();
                        if (endDateTime.toLocalTime().isBefore(LocalTime.of(18, 0))) {
                            earlyLeaveCount++;
                        }
                        
                        // 근무 시간 계산
                        Duration workDuration = Duration.between(startDateTime, endDateTime);
                        statsHours += workDuration.toHours() + workDuration.toMinutesPart() / 60.0;
                        statsDay++;
                    } else {
                        // 결근 체크
                        if (startDateTime.toLocalDate().isEqual(today)) {
                            absentCount++;
                        }
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("lateCount", lateCount);
        result.put("absentCount", absentCount);
        result.put("earlyLeaveCount", earlyLeaveCount);
        result.put("statsDay", statsDay);
        result.put("statsHours", statsHours);

        return result;
    }

}