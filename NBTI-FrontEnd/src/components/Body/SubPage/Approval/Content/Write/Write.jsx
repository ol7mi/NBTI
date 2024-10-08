import { useEffect, useState } from 'react';
import { DocDraft } from './DocDraft/DocDraft';
import { DocLeave } from './DocLeave/DocLeave';
import { DocVacation } from "./DocVacation/DocVacation";
import styles from './Write.module.css';
import { host } from '../../../../../../config/config';
import axios from 'axios';
import { useApprovalLine, useDocLeave, useDocVacation, useEditorCheck, useReferLine } from '../../../../../../store/store';
import { useLocation, useNavigate } from 'react-router-dom';
import SecondModal from '../SecondModal/SecondModal';
import Swal from 'sweetalert2';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {faPenToSquare} from '@fortawesome/free-solid-svg-icons';

export const Write = (props)=>{

    const [userdata, setUserData] = useState({}); 
    const [docdata, setDocData] = useState({effective_date:'', cooperation_dept:'', title:'', content:'', emergency:'' });
    const [content, setContent] = useState('');
    const [date, setDate] = useState('');
    const [dept, setDept] = useState('');
    const [title, setTitle] = useState('');
    const { referLine, resetReferLine} = useReferLine();
    const { approvalLine, resetApprovalLine } = useApprovalLine();
    const { docLeave } = useDocLeave();
    const { docVacation } = useDocVacation();
    const {setEditorCheck} = useEditorCheck();
    const [refer, setRefer] = useState([]);
    const [fileInfo, setFileInfo] = useState([]);
    const [files, setFiles] = useState([]);

    const location = useLocation();
    const setlist = props.setlist || location.state?.setlist || "기본 문서 제목";
    const temp_seq = location.state?.temp_seq || '';
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false); // 두 번째 모달 상태

    const navi = useNavigate();

    // ===== 아이콘 =====
    useEffect(() => {
        // 외부 스타일시트를 동적으로 추가
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
        document.head.appendChild(link);

        // 컴포넌트가 언마운트될 때 스타일시트를 제거
        return () => {
        document.head.removeChild(link);
        };
    }, []);


    useEffect(()=>{
        // console.log('URL이 변경되었습니다:', location.pathname);
        setFileInfo([]);
        setFiles([]);
        // console.log("파일이 날아갑니당");
    },[location])
      

    // 결재션 변경 창 열기
    const handleModal = () =>{
        setEditorCheck(false);
        setIsSecondModalOpen(true);
        resetApprovalLine(); // 결재선 초기화
        // 모달 창 열기
    }

    // 결재선 변경 창 닫기
    const closeSecondModal = () => {
        setEditorCheck(true);
        setIsSecondModalOpen(false); // 두 번째 모달 닫기
      };


    // 기안하기
    const approvalSubmit =  async () =>{

        // 필수 필드 검증
        if (setlist === "휴가신청서") {
            // 휴가 신청서의 경우
            if (!docVacation.category || !docVacation.start || !docVacation.end) {
                Swal.fire(
                    { 
                      icon: 'error',
                      title: '휴가 종류와 기간을 선택해 주세요.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                    );
                // alert("휴가 종류와 기간을 선택해 주세요.");
                return;
            }
        } else if (setlist === "휴직신청서") {
            // 휴직 신청서의 경우
            const phoneRegex = /^010-\d{4}-\d{4}$/;

            if (!docLeave.start || !docLeave.end ) {
                Swal.fire(
                    { 
                      icon: 'error',
                      title: '휴직 기간을 선택해 주세요.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                    );
                // alert("휴직 기간을 선택해 주세요.");
                return;
            }else if(!docLeave.reason){
                Swal.fire(
                    { 
                      icon: 'error',
                      title: '휴직 사유를 작성해 주세요.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                    );
                // alert("휴직 기간을 선택해 주세요.");
                return;
            }else if(!phoneRegex.test(docLeave.phone)){
                Swal.fire({
                    icon:'warning',
                    title:'연락처는 000-0000-0000 과 같이 입력해주세요',
                    showConfirmButton: false,
                    timer: 1500
                  });
                  return;
            }
            
        } else if (setlist === "업무기안서") {
            // 업무 기안서의 경우
            if (!date || !dept || !title || !content) {
                Swal.fire(
                    { 
                      icon: 'error',
                      title: '업무 기안서의 모든 필드를 입력해 주세요.',
                      showConfirmButton: false,
                      timer: 1500
                    }
                    );
                // alert("업무 기안서의 모든 필드를 입력해 주세요.");
                return;
            }
        }

        // Swal 모달을 사용하여 긴급 문서 여부 확인
    const Sresult = await Swal.fire({
        icon: 'question',
        title: '전자결제',
        text: '긴급 문서로 하시겠습니까?',
        showCloseButton: true,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: '긴급',
        cancelButtonText: '일반',
        customClass: {
            popup: 'custom-swal-popup',  // 커스텀 클래스 이름 지정
        }
    });

    let result = false;

    if (Sresult.dismiss === Swal.DismissReason.close) {
        // 닫기 버튼을 클릭한 경우
        return; // 아무 작업도 하지 않고 종료
    }else if (Sresult.isConfirmed) {
        // 확인 버튼을 클릭한 경우
        const confirmResult = await Swal.fire({
            icon: 'warning',
            title: '긴급 문서로 기안됩니다.',
        });
        result = true; // 긴급 문서로 처리
    } else if (Sresult.dismiss === Swal.DismissReason.cancel) {
        // 취소 버튼을 클릭한 경우
        await Swal.fire({
            icon: 'info',
            title: '일반 문서로 기안됩니다.'
        });
        result = false; // 긴급 문서로 처리하지 않음
    }
            
        // let result = window.confirm("긴급 문서로 하시겠습니까?");
        // console.log("개별", date, dept, title, content);
        let requestData;


         // 파일 업로드 처리
         const formData = new FormData();
        
         if (files && files.length > 0) {
             files.forEach(file => {
                 formData.append('files', file); // 'files' is the expected part name on the server side
             });
         } else {
            //  console.error("업로드할 파일이 없습니다.");
         }

        if(setlist === "업무기안서"){
            requestData = {
                docDraft: {
                    effective_date: date,
                    cooperation_dept: dept,
                    title: title,
                    content: content
                },
                approvalLine: approvalLine,
                referLine: referLine,
                emergency: result,
                docType : 1,
                temp_seq: temp_seq
            };  
        }else if(setlist === "휴가신청서"){
            requestData = {
                docVacation: docVacation,
                approvalLine: approvalLine,
                referLine: referLine,
                emergency: result,
                docType : 3,
                temp_seq: temp_seq
            };

        }else if(setlist === "휴직신청서"){
            requestData = {
                docLeave: docLeave,
                approvalLine: approvalLine,
                referLine: referLine,
                emergency: result,
                docType : 2,
                temp_seq: temp_seq
            };
        }
    
        formData.append('requestData', JSON.stringify(requestData));

        files.forEach(fileObj => {
            formData.append('files', fileObj.file); // 파일 객체를 FormData에 추가
        });

        console.log("refer",referLine);

        // Send the request
        try {
            await axios.post(`${host}/approval`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            resetReferLine();
            resetApprovalLine();
            setEditorCheck(false);
            navi("/approval");
        } catch (error) {
            console.error("문서 제출 실패:", error);
        }
    }

    // 임시저장
    const tempSubmit = async () => {

        const Sresult = await Swal.fire({
            icon: 'question',
            title: '전자결제',
            text: '첨부 파일은 저장되지 않습니다.',
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            customClass: {
                popup: 'custom-swal-popup',  // 커스텀 클래스 이름 지정
            }
        });
    
        let result = false;

        if (Sresult.isConfirmed) {
            // 확인 버튼을 클릭한 경우
            await Swal.fire({
                icon: 'success',
                title: '임시 저장이 완료 되었습니다. 임시 저장함으로 이동합니다.',
            });
            result = true;
        } else if (Sresult.dismiss === Swal.DismissReason.cancel) {
            // 취소 버튼을 클릭한 경우
            await Swal.fire({
                icon: 'error',
                title: '임시 저장이 취소되었습니다.'
            });
            result = false; // 긴급 문서로 처리하지 않음
        }

        let requestData;

        if(result){
            if(setlist === "업무기안서"){
                // docData => 업무기안서 내용 => else if 시 다른 변수로 변경 필요
                requestData = {
                    docDraft: {
                        effective_date: date,
                        cooperation_dept: dept,
                        title: title,
                        content: content
                    },
                    approvalLine: approvalLine,
                    referLine: referLine,
                    emergency: false,
                    docType : 1
                };  
                // console.log("결재",approvalLine);
                // console.log("참조",referLine);
            }else if(setlist === "휴가신청서"){
                requestData = {
                    docVacation: docVacation,
                    approvalLine: approvalLine,
                    referLine: referLine,
                    emergency: false,
                    docType : 3
                };

            }else if(setlist === "휴직신청서"){
                requestData = {
                    docLeave: docLeave,
                    approvalLine: approvalLine,
                    referLine: referLine,
                    emergency: false,
                    docType : 2
                };
            }

            try {
                await axios.post(`${host}/approval/tempSave`, requestData);
                resetReferLine();
                resetApprovalLine();
                navi("/approval/listDocTemp/");
            } catch (error) {
                console.error("문서 제출 실패:", error);
            }
        }
    };

     // 파일 첨부
     const handleFileChange  = (e)=>{

        // 선택한 파일
        const selectedFiles = Array.from(e.target.files);
        // 기존 있던 파일
        const currentFileNames = files.map(fileObj => fileObj.file.name);
        // const count = 0;
        // console.log("파일 선택 목록 보기", selectedFiles);
        // console.log("파일 기존 목록 보기", files);
        // console.log("파일 최근 목록 보기", currentFileNames);
        const date = Date.now();

        // 중복 파일 체크 및 필터링
        const nonDuplicateFiles = selectedFiles.filter(file => !currentFileNames.includes(file.name));
        const nonDuplicateCheck = files.filter(file=>!currentFileNames.includes(file.name));

        // console.log("전체 배열 길이", nonDuplicateCheck);
        if (nonDuplicateFiles.length === 0) {
            Swal.fire(
                { 
                  icon: 'warning',
                  title: '전자결제',
                  text: '이미 선택된 파일입니다.'
                }
                );
        }
        // console.log("중복제거 목록 보기", nonDuplicateFiles);

        const MAX_SIZE = 1024 * 1024 * 100; // 100MB

        const validFiles = nonDuplicateFiles.filter(file => {
            if (file.size > MAX_SIZE) {
                Swal.fire(
                    { 
                      icon: 'warning',
                      title: '전자결제',
                      text: '100MB 용량 제한을 초과했습니다.'
                    }
                    );
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            return; // 유효한 파일이 없으면 종료
        }

        const newFileInfo = validFiles.map(file => ({
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`, // Size in KB
            id: file.name + date // Unique identifier
        }));

        const newFile = validFiles.map(file => ({
            file, // 원본 파일 객체
            id: file.name + date // 고유 식별자
        }));

        if (files.length + newFile.length > 5) {
            Swal.fire(
                { 
                  icon: 'warning',
                  title: '전자결제',
                  text: '파일은 최대 5개까지 첨부할 수 있습니다.'
                }
                );
            // alert("파일은 최대 5개까지 첨부할 수 있습니다.");
            return;
        }

        setFiles(prev => [...prev, ...newFile]); // 파일 객체를 그대로 저장

        setFileInfo(prev => {
            const updatedFileInfo = [...prev, ...newFileInfo];
            // console.log("업데이트된 파일 정보 배열:", updatedFileInfo);
            // console.log("setfiles데이터", files);
            return updatedFileInfo;
        });
    }

    const handleFileDelete = (fileId) => {
        // Remove file from files array
        // console.log(fileId);
        const updatedFiles = files.filter((file) => file.id !== fileId);
        setFiles(updatedFiles);

        // Remove file info from fileInfo array
        const updatedFileInfo = fileInfo.filter((file) => file.id !== fileId);
        setFileInfo(updatedFileInfo);
    };

    useEffect(()=>{
        axios.get(`${host}/members/docData`)
        .then((resp)=>{
            // console.log("정보 받아오기",resp);
            // console.log("테스트",resp.data.NAME);
            setUserData(resp.data);
        })
        .catch((err)=>{
            console.log(err);
        })
    },[])

    useEffect(()=>{
        // console.log("참조라인 데이터 확인",referLine);
        if(referLine.length > 0){
        axios.post(`${host}/members/approvalSearch`,referLine)
        .then((resp)=>{
            // console.log("데이터 확인",resp.data);
            setRefer(resp.data);
            // console.log(refer);
        })
        .catch((err)=>{
            console.log(err);
        })
    }
    },[referLine])

    useEffect(()=>{
        // console.log("파일",files);
        // console.log("파일 정보",fileInfo);
    },[files, fileInfo])

    return(
        <div className={styles.container}>
            <div className={styles.title}>
                {setlist}
            </div>
            <div className={styles.content_box}>
                <div className={styles.content_left}>
                    <div className={styles.btns}>
                        <div className={`${styles.approval_submit_btn} ${styles.btn}`} onClick={approvalSubmit}><i className="fa-solid fa-pen-to-square"></i>결재요청</div>
                        <div className={`${styles.approval_temp_btn} ${styles.btn}`} onClick={tempSubmit}><i className="fa-regular fa-folder-open"></i>임시저장</div>
                        {/* <div className={`${styles.approval_prev_btn} ${styles.btn}`}>미리보기</div> */}
                        <div className={`${styles.approval_change_btn} ${styles.btn}`} onClick={handleModal}><i className="fa-solid fa-users"></i>결재선변경</div>
                        {/* <div className={`${styles.approval_change_btn} ${styles.btn}`} onClick={handleModal}><i class="fa-solid fa-users"></i>임시저장</div> */}
                    </div>
                    <div className={styles.write_box}>
                        {   
                        setlist === '휴가신청서' ?  <DocVacation userdata={userdata}/>
                        : setlist === '휴직신청서' ? <DocLeave userdata={userdata} setContent={setContent} content={content}/>
                        : <DocDraft userdata={userdata} setDocData={setDocData} setContent={setContent} content={content} setDate={setDate} setDept={setDept} setTitle={setTitle}/>
                        }   
                    </div>
                    
                    <div className={styles.files}>
                        <div className={styles.file_title}> 첨부 파일</div>
                        <div className={styles.file_content}>
                            <div className={styles.file_input}>
                                <input type="file" multiple onChange={handleFileChange} /> <span>파일 첨부는 최대 5개 까지 가능합니다.</span>
                            </div>
                            <div className={styles.file_list}>
                                {fileInfo.map((file, index) => (
                                    <div key={index} className={styles.file_item}>
                                        {file.name} ({file.size}) <button className={styles.filedeletebtn} onClick={() => handleFileDelete(file.id)}>X</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.content_right}>
                    <div className={styles.content_right_title}>참조/열람자</div>
                    <div className={styles.content_right_content}>
                    {
                        refer.map((refer)=>{
                            return(
                                <div className={styles.refer} key={refer.ID}>
                                    {refer.NAME} ({refer.JOB_NAME}) / {refer.DEPT_NAME} / {refer.TEAM_NAME}
                                </div>
                            );
                        })
                    }
                    </div>
                </div>
            </div>
            <SecondModal isOpen={isSecondModalOpen} onClose={closeSecondModal}/> 
        </div>
    );
}