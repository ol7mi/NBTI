package com.nbti.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.nbti.dto.Group_chatDTO;
import com.nbti.dto.Group_memberDTO;

@Repository
public class Group_chatDAO {
	@Autowired
	private SqlSession mybatis;
	
	public int insert() throws Exception{
		Group_chatDTO dto =new Group_chatDTO();
		//dto.setName(member_id);
		mybatis.insert("Group_chat.insert",dto);
		return dto.getSeq();
	}
	
	public List<Group_chatDTO> getList(List<Group_memberDTO> list) throws Exception{
		if(list.size()>0) {
			Map<String, Object> map = new HashMap<>();
		    map.put("list", list);
		    
			return mybatis.selectList("Group_chat.list",map);
		}
		return null;
	}
	
	public void delete(int seq) throws Exception{
		mybatis.delete("Group_chat.delete",seq);
	}
}
