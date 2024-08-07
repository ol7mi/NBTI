package com.nbti.dto;

import java.sql.Timestamp;

public class TempBoardDTO {

	private int seq;
	private String title;
	private String contents;
	private String member_id;
	private Timestamp write_date;
	private int board_code; 
	
	public TempBoardDTO() {
	}

	public TempBoardDTO(int seq, String title, String contents, String member_id, Timestamp write_date,
			int board_code) {
		super();
		this.seq = seq;
		this.title = title;
		this.contents = contents;
		this.member_id = member_id;
		this.write_date = write_date;
		this.board_code = board_code;
	}

	public int getSeq() {
		return seq;
	}

	public void setSeq(int seq) {
		this.seq = seq;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContents() {
		return contents;
	}

	public void setContents(String contents) {
		this.contents = contents;
	}

	public String getMember_id() {
		return member_id;
	}

	public void setMember_id(String member_id) {
		this.member_id = member_id;
	}

	public Timestamp getWrite_date() {
		return write_date;
	}

	public void setWrite_date(Timestamp write_date) {
		this.write_date = write_date;
	}

	public int getBoard_code() {
		return board_code;
	}

	public void setBoard_code(int board_code) {
		this.board_code = board_code;
	}

	
	
}
