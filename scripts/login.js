import { setTitle } from "./utils.js";
import { StatusMessages } from "./constants.js";
import { getUserInfo, checkIdUsable } from "./api.js";

export async function displayLoginPage() {
	setTitle("로그인");
	const loginHtml = `
        <h1>로그인</h1>
        <form action="/login" method="post">
            <input type="text" name="userID" placeholder="아이디" required>
            <input type="password" name="userPW" placeholder="비밀번호" required>
            <input type="submit" value="로그인">
        </form>
        <p>계정이 없나요? <a href="./#register">회원가입</a></p>
    `;
	document.getElementById("content").innerHTML = loginHtml;
}

export async function loginStatusControl() {
    
    const userInfo = await getUserInfo();
    const loginStatus = document.getElementById("login-status");

    if (userInfo.status == StatusMessages.LOGIN_REQUIRED) {
        return;
    } else {
        const userID = userInfo.content.user_id;
        loginStatus.innerText = userID;
        loginStatus.setAttribute("href", `./#userinfo/${userID}`)

    }
}

export async function displayUserInfo(userId) {
    const userData = await getUserInfo(true);
    const userInfo = userData.content

    if (userData.status == StatusMessages.LOGIN_REQUIRED) {
        alert("로그인이 필요합니다.")
        window.history.back();
    }

    const userInfoHtml = `
        <h1>${userInfo.user_id}</h1>
        <a href="/logout">로그아웃</a>
        <a href="./#changeUserInfo">정보 수정</a>
        <ul>
            <li>회원가입일 : ${userInfo.registered_date}</li>
            <li>유저 상태 : ${userInfo.user_status}</li>
        </ul>
    `;
    document.getElementById("content").innerHTML = userInfoHtml;

}

export async function displayRegister(userId) {
    
    const registerHtml = `
    <div id="registerDiv">
        <h1>회원가입</h1>
        <form action="javascript:null;">
            <div>
                <label for="userId">아이디:</label>
                <input id="userId" required>
                <button id="check-id">아이디 확인</button>   
            </div>

            <div>
                <label for="userPwd">비밀번호:</label>
                <input id="userPwd" type="password" required>
            </div>

            <div>
                <label for="userPwdAgain">비밀번호 재입력:</label>
                <input id="userPwdAgain" type="password" required>
            </div>

            <div>
                <label for="email">이메일:</label>
                <input id="email" required> 
            </div>
        </form>

        <button id="register">회원가입</button>
    </div>
    `;

    document.getElementById("content").innerHTML = registerHtml;


    const formTree = {
        btnCheckId : document.getElementById("check-id"),
        inputUsrId : document.getElementById("userId"),
        inputUsrPwd : document.getElementById("userPwd"),
        inputUsrPwdAgain : document.getElementById("userPwdAgain"),
        inputemail : document.getElementById("email"),
    };

    let isIdUsable = false;
    formTree.btnCheckId.onclick = async ()=> {
        const response = await checkIdUsable(formTree.inputUsrId.value);
        console.log(formTree.inputUsrId.value);
        console.log(response);
        isIdUsable = response.content.is_usable;
        alert(isIdUsable ? "사용 가능한 아이디입니다" : "이미 존재하는 아이디입니다.");
    }



}