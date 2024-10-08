package com.nbti.services;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nbti.dao.ReserveDAO;
import com.nbti.dto.ReserveDTO;

@Service
public class ReserveService {
	@Autowired
	private ReserveDAO rdao;
	
	// 예약
	public void insert(ReserveDTO dto) throws Exception{
		rdao.insert(dto);
	}
	
	// 대기 목록
	public List<ReserveDTO> waitingList(String memberId) throws Exception{
		return rdao.waitingList(memberId);
	}
	// 예약 목록
	public List<ReserveDTO> reservationList(String memberId) throws Exception{
		return rdao.reservationList(memberId);
	}
	
	// 예약 신청 취소
	public void delete(int seq) throws Exception{
		rdao.delete(seq);
	}
	
    // 예약 상태 업데이트 N->Y
	public void update(int reservationSeq) throws Exception {
		rdao.update(reservationSeq, "Y"); // 'Y'로 업데이트
    }
	
	// 승인 관리 - 반려 N->R
	public void reject(int reservationSeq) throws Exception {
		rdao.reject(reservationSeq, "R"); // 'R'로 업데이트
	}
	
	// 승인 관리 - 대기 목록 출력 
	public List<ReserveDTO> waitList() throws Exception{
		return rdao.waitList();
	}
	
	// 승인 관리 - 승인 목록 출력
	public List<ReserveDTO> approveList(Map<String, Object> params) throws Exception{
		return rdao.approveList(params);
	}

	// 승인 관리 - 반려 목록 출력
	public List<ReserveDTO> rejectList (Map<String, Object> params) throws Exception{
		return rdao.rejectList(params);
	}
	
	// 캘린더 차량 
	public List<ReserveDTO> carList () throws Exception{
		return rdao.carList();
	}
	// 캘린더 비품
	public List<ReserveDTO> suppliesList () throws Exception{
		return rdao.suppliesList();
	}
	// 캘린더 회의실
	public List<ReserveDTO> meetingRoomList () throws Exception{
		return rdao.meetingRoomList();
	}
	
	public int count () throws Exception {
		return rdao.count();
	}
	public int countR () throws Exception {
		return rdao.countR();
	}

	
	


	

}
