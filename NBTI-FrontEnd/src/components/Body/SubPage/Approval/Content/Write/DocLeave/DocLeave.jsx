import { useEffect, useState } from 'react';
import { ApprovalEditor } from '../ApprovalEditor/ApprovalEditor';
import { Header } from '../Header/Header';
import styles from './DocLeave.module.css';

export const DocLeave =({userdata})=>{

    // 저장소에 docleave 담는 거 하나 만들어서 저장시키기

    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [total, setTotal] = useState(null);

    const handleStartDate = (e) => {
        const startDate = e.target.value;
        console.log(startDate);
        setStart(startDate);
        // Reset end date and total if start date changes
        setEnd(null);
        setTotal(null);
    };

    const handleEndDate = (e) => {
        const endDate = e.target.value;
        console.log(endDate);
        setEnd(endDate);
        if (start) {
            const startDate = new Date(start);
            const endDate = new Date(e.target.value);
            const differenceInTime = endDate - startDate;
            const differenceInDays = differenceInTime / (1000 * 3600 * 24);
            const differenceInMonths = (differenceInDays / 30);
            setTotal(differenceInMonths.toFixed(1));
            console.log(differenceInMonths.toFixed(1));
        }
    };
    
    const handleAdress = (e)=>{
        console.log(e.target.innerText);
        // setDept(e.target.innerText);
    }
     
    const handlePhone = (e)=>{
        console.log(e.target.innerText);
        // setTitle(e.target.innerText);
    }
    
    const handleReason = (e)=>{
        console.log(e.target.value);
    }
    
        return (
            <div className={styles.container}>
                <div className={styles.title}>휴직신청서</div>
                <div className={styles.header}>
                    <Header userdata={userdata}/>
                </div>
                <div className={styles.submain}>
                    {/* <div className={styles.submain_box}> */}
                    <div className={styles.submain_title}>휴직 기간</div>
                        <div className={styles.submain_content}>
                        <input className={styles.submain_input} type="date" value={start || ''} onChange={handleStartDate}/>
                        <div className={styles.inputtext_inner}>~</div>
                        <input className={styles.submain_input} type="date" value={end || ''} min={start || ''} onChange={handleEndDate} disabled={!start}/>
                        <div className={styles.submain_input}> {total !== null ? `${total} 개월` : '0개월'} </div>
                </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.subtitle_title}>사유</div>
                    <textarea className={styles.subtitle_content} onInput={handleReason}></textarea>
                </div>
                <div className={styles.subtitle}>
                    <div className={styles.subtitle_title}>주소</div>
                    <div className={`${styles.subtitle_content} ${styles.align}`} contentEditable="true" onInput={handleAdress} suppressContentEditableWarning='true'> </div>
                </div>
                <div className={styles.subtitle}>
                    <div className={styles.subtitle_title}>연락처</div>
                    <div className={`${styles.subtitle_content} ${styles.align}`} contentEditable="true" onInput={handlePhone} suppressContentEditableWarning='true'></div>
                </div>
                <div className={styles.text}> - 첨부서류: 휴직 사유에 대한 증빙 서류 (예 : 질병으로 인한 휴직인 경우 진단서 등)</div>
            </div>
        );
}