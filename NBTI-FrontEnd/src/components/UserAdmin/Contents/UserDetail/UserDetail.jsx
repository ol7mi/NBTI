import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UserDetail.module.css'; // 스타일 파일 경로
import { host } from '../../../../config/config';
import { useParams, useNavigate } from 'react-router-dom';

const UserDetail = () => {
    const { id } = useParams(); // URL 파라미터에서 ID 가져오기
    const [user, setUser] = useState({
        id: '',
        pw: '',
        name: '',
        email: '',
        team_code: '',
        job_code: '',
        member_level: '',
        member_call: '',
        address: '',
        birth: '',
        gender: '',
        ent_yn: 'N',
        vacation_period: 15,
        end_date: ''
    });
    const [teams, setTeams] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 사용자 데이터 가져오기
                const response = await axios.get(`${host}/members/${id}`);
                setUser(response.data);
                
                // 팀, 직급, 권한 데이터 가져오기
                const teamsResponse = await axios.get(`${host}/members/selectTeam`);
                setTeams(teamsResponse.data);
                
                const jobsResponse = await axios.get(`${host}/members/selectJob`);
                setJobs(jobsResponse.data);
                
                const levelsResponse = await axios.get(`${host}/members/selectLevel`);
                setLevels(levelsResponse.data);
                
                setLoading(false);
            } catch (err) {
                setError('사용자 정보를 가져오는 데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                setUser(prev => ({
                    ...prev,
                    address: data.address
                }));
            }
        }).open();
    };

    const validateFormData = (formData) => {
        // 이메일 유효성 검사
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.email)) {
            alert('유효한 이메일 주소를 입력하세요.');
            return false;
        }

        // 전화번호 유효성 검사: 한국 전화번호 형식 (예: 010-1234-5678)
        const phonePattern = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/;
        if (formData.member_call && !phonePattern.test(formData.member_call)) {
            alert('유효한 전화번호를 입력하세요. (예: 010-1234-5678)');
            return false;
        }

        return true;  // 모든 유효성 검사를 통과하면 true 반환
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 유효성 검사
        if (!validateFormData(user)) {
            return;  // 유효성 검사 실패 시 함수 종료
        }
        
        axios.put(`${host}/members/updateUser`, user)
            .then(response => {
                alert('회원 정보가 성공적으로 업데이트되었습니다.');
                navigate(`/useradmin/userlist`);
            })
            .catch(error => {
               
                alert('회원 정보 업데이트 중 오류가 발생했습니다.');
            });
    };

    const handleDelete = () => {
        if (window.confirm('정말로 회원 탈퇴를 하시겠습니까?')) {
            axios.delete(`${host}/members/deleteUser/${id}`)
                .then(response => {
                    alert('회원 탈퇴가 완료되었습니다.');
                    navigate(`/useradmin/userlist`);
                })
                .catch(error => {
                   
                    alert('회원 탈퇴 중 오류가 발생했습니다.');
                });
        }
    };

    const getLevelName = (level) => {
        if (!level) return '';
        if (level.total === 'Y') return '전체 권한';
        if (level.hr === 'Y') return 'HR 권한';
        if (level.reservation === 'Y') return '예약 권한';
        if (level.message === 'Y') return '메시지 권한';
        if (level.task === 'Y') return '업무 권한';
        if (level.payment === 'Y') return '결제 권한';
        return '권한 없음';
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2>사용자 정보 수정</h2>
            
            <input
                type="text"
                placeholder="아이디"
                name="id"
                value={user.id}
                onChange={handleChange}
                required
                disabled 
            />
       
            <input
                type="text"
                placeholder="이름"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
                disabled // 이름 수정 불가
            />
            <input
                type="email"
                placeholder="이메일"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
            />
            <select
                name="team_code"
                value={user.team_code}
                onChange={handleChange}
                required
            >
                <option value="">팀 선택</option>
                {teams.map(team => (
                    <option key={team.team_code} value={team.team_code}>
                        {team.team_name}
                    </option>
                ))}
            </select>
            <select
                name="job_code"
                value={user.job_code}
                onChange={handleChange}
                required
            >
                <option value="">직급 선택</option>
                {jobs.map(job => (
                    <option key={job.job_code} value={job.job_code}>
                        {job.job_name}
                    </option>
                ))}
            </select>
            <select
                name="member_level"
                value={user.member_level}
                onChange={handleChange}
                required
            >
                <option value="">권한 선택</option>
                {levels.map(level => (
                    <option key={level.seq} value={level.seq}>
                        {getLevelName(level)}
                    </option>
                ))}
            </select>
            <input
                type="text"
                placeholder="전화번호"
                name="member_call"
                value={user.member_call}
                onChange={handleChange}
            />
            <input
                type="text"
                placeholder="주소"
                name="address"
                value={user.address}
                onChange={handleChange}
                required
                disabled // 주소 수정 불가
            />
            <button 
                type="button" 
                id="search-address-btn" 
                className={styles.searchAddressBtn}
                onClick={handleAddressSearch}
            >
                주소 검색
            </button>
            <input
                type="text"
                placeholder="생년월일"
                name="birth"
                value={user.birth}
                onChange={handleChange}
                required
                disabled // 생년월일 수정 불가
            />
            <select
                name="gender"
                value={user.gender}
                onChange={handleChange}
                required
                disabled // 성별 수정 불가
            >
                <option value="">성별</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
            </select>
          
            <input
                type="number"
                placeholder="휴가 기간"
                name="vacation_period"
                value={user.vacation_period}
                onChange={handleChange}
                disabled
            />
            <div className={styles.groupBtn}>
                <button type="button" onClick={handleSubmit}>정보 수정</button>
                <button type="button" onClick={handleDelete}>회원 탈퇴</button>
            </div>
        </div>
    );
};

export default UserDetail;
