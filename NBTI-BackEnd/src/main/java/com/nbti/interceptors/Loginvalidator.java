package com.nbti.interceptors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class Loginvalidator implements HandlerInterceptor {

	@Autowired
	private HttpSession session;
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		
		String loginID=(String)session.getAttribute("loginID");
		if(loginID!=null) {
			System.out.println("아이디 있음");
			return true;
		}
		String uri =request.getRequestURI();
		String method= request.getHeader("method");
		
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		
		return false;
	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		
	}
}