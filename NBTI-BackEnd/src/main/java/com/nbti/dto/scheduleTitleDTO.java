package com.nbti.dto;

public class scheduleTitleDTO {
	private int seq;
	private String scheduleTitle_name;
	public int getSeq() {
		return seq;
	}
	public void setSeq(int seq) {
		this.seq = seq;
	}
	public String getScheduleTitle_name() {
		return scheduleTitle_name;
	}
	public void setScheduleTitle_name(String scheduleTitle_name) {
		this.scheduleTitle_name = scheduleTitle_name;
	}
	public scheduleTitleDTO() {
		super();
	}
	public scheduleTitleDTO(int seq, String scheduleTitle_name) {
		super();
		this.seq = seq;
		this.scheduleTitle_name = scheduleTitle_name;
	}
	
	
}