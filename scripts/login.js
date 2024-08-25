import { setTitle, convertDotNotationToPath } from "./utils.js";
import { StatusMessages } from "./constants.js";
import { getUserInfo, checkIdUsable, registUser, checkPwd, setUser, deleteUser } from "./api.js";

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
        loginStatus.innerText = "로그인"
        loginStatus.setAttribute("href", `./#login`);
        return;
    } else {
        const userID = userInfo.content.user_id;
        loginStatus.innerText = userID;
        loginStatus.setAttribute("href", `./#userinfo/${userID}`);

    }
}

export async function displayUserInfo(userId) {

    const userData = await getUserInfo(true);
    const userInfo = userData.content

    if (userData.status == StatusMessages.LOGIN_REQUIRED) {
        alert("로그인이 필요합니다.")
        location.hash = "login";
        loginStatusControl();
        return;
    }

    setTitle(`사용자 : ${userInfo.user_id}`);

    const rDate = new Date(userInfo.registered_date);
    const rDateStr = rDate.toISOString().split("T")[0];

    let userInfoHtml = `
        <h1>${userInfo.user_id}</h1>
        <a href="/logout">로그아웃</a>
        <a href="./#changeUserInfo">정보 수정</a>
        <h2>기본 정보</h2>
        <ul>
            <li>회원가입일 : ${rDateStr}</li>
            <li>유저 상태 : ${userInfo.user_status}</li>
        </ul>
        <h2>최근 기여(10개)</h2>
    `;
    
    let histories = ""
    userInfo.history.forEach((e)=>{
        const np = `<li><a href="./#w/${convertDotNotationToPath(e.doc_name)}">${convertDotNotationToPath(e.doc_name)}</a>(${e.updated_time})</li>\n`;
        histories += np;
    })

    userInfoHtml += `
        <ul>
            ${histories}
        </ul>
    `

    document.getElementById("content").innerHTML = userInfoHtml;
}

export async function displayRegister() {
    
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
            <p id="message-display"></p>
            <button id="register">회원가입</button>
        </form>
    </div>
    `;

    document.getElementById("content").innerHTML = registerHtml;

    const formTree = {
        inputUsrId : document.getElementById("userId"),
        inputUsrPwd : document.getElementById("userPwd"),
        inputUsrPwdAgain : document.getElementById("userPwdAgain"),
        inputEmail : document.getElementById("email"),
    };

    const formCheck = {
        isIdUsable : false,
        isEmailVaild : false,
    };

    // 아이디 입력이 바뀔 때마다 isIdUsable false로 초기화
    formTree.inputUsrId.onchange = async ()=>{
        formCheck.isIdUsable = false;
    };

    formTree.inputEmail.onchange = async ()=> {
        const regex = new RegExp("\\w+@\\w+\\.\\w+", "i");
        const testRes = regex.test(formTree.inputEmail.value);
        formCheck.isEmailVaild = testRes;
    }

    const msgDisplay = document.getElementById("message-display");
    const btnRegister = document.getElementById("register");
    const btnCheckId = document.getElementById("check-id");

    msgDisplay.setMessage = function(msg) {
        this.innerText = msg;
    }


    btnCheckId.onclick = async ()=> {
        if (formTree.inputUsrId.value === "")
            return;

        const response = await checkIdUsable(formTree.inputUsrId.value);
        // console.log(formTree.inputUsrId.value);
        // console.log(response);
        formCheck.isIdUsable = response.content.is_usable;
        alert(formCheck.isIdUsable ? "사용 가능한 아이디입니다." : "사용할 수 없는 아이디입니다.");
    }

    const regist = async () => {
        // 조건 검사
        
        for (const name in formTree) {
            // console.log(name);
            if (formTree[name].value === "") {
                msgDisplay.setMessage("모든 입력칸은 채워져 있어야 합니다.");
                return;
            }
        }

        if (!formCheck.isIdUsable) {
            msgDisplay.setMessage("아이디 확인을 하지 않았거나 아이디를 사용할 수 없습니다.");
            return;
        }

        if (formTree.inputUsrPwd.value !== formTree.inputUsrPwdAgain.value) {
            msgDisplay.setMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!formCheck.isEmailVaild) {
            msgDisplay.setMessage("유효한 이메일 주소가 아닙니다.");
            return;
        }

        msgDisplay.setMessage("");
        const response = await registUser(
            formTree.inputUsrId.value,
            formTree.inputUsrPwd.value,
            formTree.inputEmail.value
        );

        if (response.status == StatusMessages.SUCCESS) {
            location.hash = "registerComplete";
            return;
        } else {
            alert(response.status);
            return;
        }
    }

    btnRegister.onclick = regist;
}

export async function displayRegisterComplete() {
    const completeHtml = `
        <h1>회원가입이 완료되었습니다!</h1>
        <a href="./#login">로그인하기</a>
    `;

    document.getElementById("content").innerHTML = completeHtml;
}

export async function displayChangeInfo() {


    const changeInfoHtml = `
    <div id="registerDiv">
        <h1>정보 수정</h1>
        <form action="javascript:null;">
            <div>
                <label for="userId">아이디:</label>
                <input id="userId" required disabled> 
            </div>

            <div>
                <label for="userPwd">비밀번호:</label>
                <input id="userPwd" type="button" value="비밀번호 변경하기" onclick="location.hash = 'changeUserPassword';">
            </div>

            <div>
                <label for="email">이메일:</label>
                <input id="email" required> 
            </div>
            <p id="message-display"></p>
            <button id="change">변경</button>
            <button id="exit">탈퇴하기</button>
        </form>
    </div>
    `;

    document.getElementById("content").innerHTML = changeInfoHtml;
    const inputUsrId = document.getElementById("userId");
    const inputUsrEmail = document.getElementById("email");
    const btnChange = document.getElementById("change");
    const btnExit = document.getElementById("exit");
    const msgDisplay = document.getElementById("message-display");

    msgDisplay.setMessage = function(msg) {
        this.innerText = msg;
    }

    const userInfo = await getUserInfo(true);
    inputUsrId.value = userInfo.content.user_id;
    inputUsrEmail.value = userInfo.content.email;

    const formCheck = {
        isEmailVaild : false
    };

    inputUsrEmail.onchange = async () =>{
        const regex = new RegExp("\\w+@\\w+\\.\\w+", "i");
        const testRes = regex.test(inputUsrEmail.value);
        formCheck.isEmailVaild = testRes;
    }

    btnChange.onclick = async ()=> {
        if (!formCheck.isEmailVaild) {
            msgDisplay.setMessage("유효한 이메일 주소가 아닙니다.");
            return;
        }

        const response = await setUser({ email:inputUsrEmail.value });
        alert(response.status);
        displayChangeInfo();
    }

    btnExit.onclick = async ()=> {
        if (confirm("정말로 탈퇴하시겠습니까?")) {
            const response = await deleteUser();
            alert(response.status);
            location.hash = "";
            location.reload();
        }
    }

}

/**
 * 민감 정보 접근시 비밀번호 입력 재요구를 위한 함수
 * @param {*} params 
 */
export async function displayPasswordCheck(callbackFn) {
    // console.log(next);

    const userData = await getUserInfo(false);
    // const userInfo = userData.content

    if (userData.status == StatusMessages.LOGIN_REQUIRED) {
        alert("로그인이 필요합니다.")
        window.history.back();
    }

    document.getElementById("content").innerHTML = `
        <h1>비밀번호 입력</h1>
        <form action="javascript:null;">
            <input placeholder="비밀번호 입력", id="userPwd" type="password" required>
            <p id="message-display"></p>
            <button id="confirm">확인</button>
        </form>

    `;
    const inputPwd = document.getElementById("userPwd");
    const btnConfirm = document.getElementById("confirm");
    const msgDisplay = document.getElementById("message-display");

    msgDisplay.setMessage = function(msg) {
        this.innerText = msg;
    }

    btnConfirm.onclick = async ()=> {
        const pwd = inputPwd.value;

        if (pwd === "") {
            msgDisplay.setMessage("모든 입력칸은 채워져 있어야 합니다.");
            return;
        }
        
        const response = await checkPwd(pwd);

        if (response.status == StatusMessages.SUCCESS) {
            callbackFn();
        } else {
            msgDisplay.setMessage("비밀번호가 틀립니다.");
        }
    }

}

export async function displayPasswordChange() {
    document.getElementById("content").innerHTML = `
    <div id="registerDiv">
        <h1>비밀번호 변경</h1>
        <form action="javascript:null;">

            <div>
                <label for="userPwd">비밀번호:</label>
                <input id="userPwd" type="password" required>
            </div>

            <div>
                <label for="userPwdAgain">비밀번호 재입력:</label>
                <input id="userPwdAgain" type="password" required>
            </div>
            <p id="message-display"></p>
            <button id="register">변경</button>
        </form>
    </div>
    `;


    const formTree = {
        inputUsrPwd : document.getElementById("userPwd"),
        inputUsrPwdAgain : document.getElementById("userPwdAgain"),
    };
    const msgDisplay = document.getElementById("message-display");
    const btnRegister = document.getElementById("register");

    msgDisplay.setMessage = function(msg) {
        this.innerText = msg;
    }

    const regist = async () => {
        // 조건 검사
        
        for (const name in formTree) {
            // console.log(name);
            if (formTree[name].value === "") {
                msgDisplay.setMessage("모든 입력칸은 채워져 있어야 합니다.");
                return;
            }
        }


        if (formTree.inputUsrPwd.value !== formTree.inputUsrPwdAgain.value) {
            msgDisplay.setMessage("비밀번호가 일치하지 않습니다.");
            return;
        }


        msgDisplay.setMessage("");
        const response = await setUser({pwd:formTree.inputUsrPwd.value});
        alert(response.status);
        displayChangeInfo();
    }

    btnRegister.onclick = regist;

}