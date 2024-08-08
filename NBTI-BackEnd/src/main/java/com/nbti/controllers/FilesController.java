package com.nbti.controllers;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nbti.commons.RealpathConfig;
import com.nbti.dto.MembersDTO;
import com.nbti.services.FilesService;
import com.nbti.services.MembersService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/files")
public class FilesController {
	
	@Autowired
	private HttpSession session;
	@Autowired
	private FilesService serv;
	
	@Autowired
	private MembersService mserv;
	
	
	@GetMapping("/downloadChat")
	public void download(@RequestParam String oriname,@RequestParam String sysname, HttpServletResponse response) throws Exception{
		String realpath= RealpathConfig.realpath +"chat";
		File target =new File(realpath+"/"+sysname);
		
		oriname =new String(oriname.getBytes(),"ISO-8859-1");
		response.setHeader("content-disposition", "attachment;filename=\""+oriname+"\"");
		try(DataInputStream dis = new DataInputStream(new FileInputStream(target));
			DataOutputStream dos = new DataOutputStream(response.getOutputStream());){
			byte[] fileContents =new byte[(int)target.length()];
			dis.readFully(fileContents);
			dos.write(fileContents);
			dos.flush();	
		}
	}
	
	@PutMapping("mypageUpdate")
	public ResponseEntity<Void> update(@RequestBody MembersDTO dto,MultipartFile file) throws Exception {
		String id = (String)session.getAttribute("loginID");
		dto.setId(id);
		System.out.println(dto.getAddress() +":"+ dto.getEmail() +":"+ dto.getMember_call());
		serv.mypageUpdate(dto, file);
		return ResponseEntity.ok().build();
	}
	
	@ExceptionHandler(Exception.class)
	public String exceptionHandler(Exception e) {
		e.printStackTrace();
		return "error";
	}
	
	
	
}
