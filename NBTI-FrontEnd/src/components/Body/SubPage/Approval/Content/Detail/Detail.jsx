import axios from 'axios';
import { host } from '../../../../../../config/config';
import styles from './Detail.module.css';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApprovalLine, useDocLeave, useDocVacation, useReferLine } from '../../../../../../store/store';
import html2pdf from 'html2pdf.js';
import { DocLeave } from './DocLeave/DocLeave';
import { Header } from './Header/Header';
import { DocDraft } from './DocDraft/DocDraft';
import { DocVacation } from './DocVacation/DocVacation';
import { ApprovalModal } from '../ApprovalModal/ApprovalModal';

export const Detail=()=>{

    const [userdata, setUserData] = useState({}); 
    // const [docdata, setDocData] = useState({effective_date:'', cooperation_dept:'', title:'', content:'', emergency:'' });
    //useLoaction으로 값 받아오기 => 객체이기 때문에 구조분할로 받는것이 용이
    const location = useLocation();
    const { seq, setlist, list } = location.state || {};
    console.log("seq:", seq);
    console.log("setlist:", setlist);
    console.log("list:", list);


    const [approvalData, setApprovalData] = useState([]);
    const [referData, setReferData] = useState([]); 
    const [docCommonData, setDocCommonData] = useState({}); 
    const [docLeave, setDocLeave] = useState({}); 
    const [docVacation, setDocVacation] = useState({}); 
    const [docDraft, setDocDraft] = useState({}); 
    const [approvalYN, setApprovalYN] = useState('');

    // 모달 표시 여부
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 내 정보 받아오기 (이게 필요할까..?)
                const userDataResponse = await axios.get(`${host}/members/docData`);
                // console.log("내정보",userDataResponse);
                setUserData(userDataResponse.data);

                // 문서 공통 정보 받아오기
                const docDataResponse = await axios.get(`${host}/approval/${seq}`)
                // console.log("문서공통정보",docDataResponse);
                console.log("문서코드", docDataResponse.data.doc_sub_seq);
                setDocCommonData(docDataResponse.data);
                let form_code = docDataResponse.data.doc_sub_seq;
                // 문서양식 별 데이터 받아오기
                if(form_code == 1){
                    // 업무기안
                    const docMainDataResponse = await axios.get(`${host}/docDraft/${seq}`);
                    console.log("업무기안서",docMainDataResponse);
                    setDocDraft(docMainDataResponse.data);
                }
                else if(form_code == 2){
                    // 휴직 신청서
                    const docMainDataResponse = await axios.get(`${host}/docLeave/${seq}`);
                    console.log("휴직신청서 데이터 받아왔지요");
                    console.log("휴직신청서",docMainDataResponse);
                    setDocLeave(docMainDataResponse.data);
                }else if(form_code == 3){
                    // 휴가 신청서
                    const docMainDataResponse = await axios.get(`${host}/docVacation/${seq}`);
                    console.log("휴가신청서",docMainDataResponse);
                    setDocVacation(docMainDataResponse.data);
                }
                else{
                    console.log("값이 안나오는 중");
                }
                // 결재라인 정보 받아오기
                const approvalLineResponse = await axios.get(`${host}/approvalLine/${seq}`);
                setApprovalData(approvalLineResponse.data);
                console.log("결재라인 체크",approvalLineResponse.data);

                // 참조라인 정보 받아오기
                const referLineResponse = await axios.get(`${host}/referLine/${seq}`);
                setReferData(referLineResponse.data);
                // console.log("참조라인확인",referLineResponse.data);

    
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [seq]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error occurred: {error.message}</p>;

    // 문서 다운로드 
    const handleDownload = () => {
        const element = document.getElementById('content-to-print');
        console.log("다운로드 클릭");
        const opt = {
            margin:       1,
            filename:     'document.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };


    const HandleSubmit = (e) =>{
        console.log("이름값 확인",e.target.innerText);
        setApprovalYN(e.target.innerText);
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false); // 모달 닫기
    };


    return(
        <div className={styles.container}>
            <div className={styles.title}>
                {setlist}
            </div>
            <div className={styles.content_box} id='content-to-print'>
                <div className={styles.content_left}>
                    {
                        list == 'doc' ?
                        <>
                        <div className={styles.btns}>
                            <div className={`${styles.approval_submit_btn} ${styles.btn}`}><i class="fa-solid fa-pen-to-square"></i>재기안</div>
                            <div className={`${styles.approval_temp_btn} ${styles.btn}`} onClick={handleDownload}><i class="fa-regular fa-folder-open"></i>다운로드</div>
                            {/* <div className={`${styles.approval_prev_btn} ${styles.btn}`}>미리보기</div> */}
                            <div className={`${styles.approval_change_btn} ${styles.btn}`}><i class="fa-solid fa-users"></i>복사하기</div>
                        </div>
                        </>
                        : list == '결재 대기' ?
                        <>
                        <div className={styles.btns}>
                            <div className={`${styles.approval_submit_btn} ${styles.btn}`} onClick={HandleSubmit}><i class="fa-solid fa-pen-to-square"></i>결재승인</div>
                            <div className={`${styles.approval_back_btn} ${styles.btn}`} onClick={HandleSubmit}><i class="fa-regular fa-folder-open"></i>결재반려</div>
                            <div className={`${styles.approval_download_btn} ${styles.btn}`} onClick={handleDownload}><i class="fa-regular fa-folder-open"></i>다운로드</div>
                            <div className={`${styles.approval_copy_btn} ${styles.btn}`}><i class="fa-solid fa-users"></i>복사하기</div>
                        </div>
                        </>
                        :
                        <>
                        <div className={styles.btns}>
                            <div className={`${styles.approval_download_btn} ${styles.btn}`} onClick={handleDownload}><i class="fa-regular fa-folder-open"></i>다운로드</div>
                            <div className={`${styles.approval_copy_btn} ${styles.btn}`}><i class="fa-solid fa-users"></i>복사하기</div>
                        </div>
                        </>
                    }
                    <div className={styles.write_box}>
                        <div className={styles.write_title}>{setlist}</div>
                        <div className={styles.write_header}>
                            <Header docCommonData={docCommonData} userdata={userdata} approvalData={approvalData}/>
                        </div>
                        <div className={styles.write_container}>
                        {   
                        setlist === '휴가신청서' ?  <DocVacation docVacation={docVacation} setDocVacation ={setDocVacation}/>
                        : setlist === '휴직신청서' ? <DocLeave docLeave={docLeave} setDocLeave={setDocLeave}/>
                        : <DocDraft setDocDraft={setDocDraft} docDraft={docDraft}/>
                        }   
                        </div>
                    </div>
                    <div className={styles.files}>
                        첨부파일 넣기
                    </div>
                </div>
                <div className={styles.content_right}>
                    <div className={styles.content_right_title}>참조/열람자</div>
                    <div className={styles.content_right_content}>
                    {/* {
                        referLine.map((refer)=>{
                            return(
                                <div className={styles.refer}>
                                    {refer.name} 직급 / 다섯글자부 / 다섯글자부
                                </div>
                            );
                        })
                    } */}
                    </div>
                </div>
            </div>
            {showModal && <ApprovalModal approvalYN={approvalYN} onClose={handleCloseModal} seq={seq} />}
        </div>
    );

}