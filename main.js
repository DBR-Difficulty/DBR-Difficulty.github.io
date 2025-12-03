import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgU5OwLsDBoTeq_jXS-frSAf9kDDwl6L0",
  authDomain: "dbr-ir.firebaseapp.com",
  projectId: "dbr-ir",
  storageBucket: "dbr-ir.firebasestorage.app",
  messagingSenderId: "464886830974",
  appId: "1:464886830974:web:f90d3605f62673136f052f",
  measurementId: "G-THHFG18D5G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function translateAuthError(error) {
  const code = error.code;

  const messages = {
    // 共通
    "auth/invalid-api-key": "APIキーが無効です。",
    "auth/app-not-authorized": "このアプリはFirebaseプロジェクトで承認されていません。",
    "auth/operation-not-allowed": "この認証方法は有効化されていません。",
    "auth/unauthorized-domain": "認証元ドメインが許可されていません。",
    "auth/network-request-failed": "ネットワークエラーが発生しました。接続を確認してください。",
    "auth/internal-error": "内部エラーが発生しました。",

    // メール・パスワード系
    "auth/invalid-email": "メールアドレスの形式が正しくありません。",
    "auth/missing-email": "メールアドレスが入力されていません。",
    "auth/email-already-in-use": "このメールアドレスは既に使用されています。",
    "auth/user-not-found": "ユーザーが見つかりません。メールアドレスを確認してください。",
    "auth/user-disabled": "このユーザーアカウントは無効化されています。",
    "auth/wrong-password": "パスワードが間違っています。",
    "auth/weak-password": "パスワードは8文字以上にしてください。",
    "auth/missing-password": "パスワードが入力されていません。",

    // アカウント操作系
    "auth/requires-recent-login": "この操作を行うには、最近ログインしている必要があります。",
    "auth/too-many-requests": "試行回数が多すぎます。しばらく経ってから再試行してください。",
    "auth/credential-already-in-use": "この認証情報は既に使用されています。",
    "auth/account-exists-with-different-credential": "既に別の方法で同じメールアドレスのアカウントが存在します。",
    "auth/email-already-in-use": "このメールアドレスはすでに使用されています。",

    // OAuth / SNSログイン
    "auth/popup-closed-by-user": "認証ウィンドウが閉じられました。再度お試しください。",
    "auth/cancelled-popup-request": "認証リクエストがキャンセルされました。",
    "auth/popup-blocked": "ポップアップがブロックされました。ブラウザ設定を確認してください。",
    "auth/invalid-credential": "無効なアカウントです。メールアドレス、パスワードが間違っているか、メールアドレスの認証が完了していません。",
    "auth/missing-credential": "認証情報が不足しています。",
    "auth/invalid-verification-code": "確認コードが無効です。",
    "auth/missing-verification-code": "確認コードが入力されていません。",
    "auth/invalid-verification-id": "確認IDが無効です。",
    "auth/missing-verification-id": "確認IDが不足しています。",
    "auth/code-expired": "確認コードの有効期限が切れています。",
    "auth/invalid-phone-number": "電話番号の形式が無効です。",
    "auth/missing-phone-number": "電話番号が入力されていません。",

    // リセット・メール送信系
    "auth/invalid-action-code": "アクションコードが無効です。",
    "auth/missing-action-code": "アクションコードが不足しています。",
    "auth/expired-action-code": "アクションコードの有効期限が切れています。",
    "auth/invalid-password": "パスワードが無効です。",
    "auth/too-many-requests": "操作回数が多すぎます。しばらく経ってからお試しください。",

    // その他
    "auth/unsupported-persistence-type": "サポートされていない永続化タイプです。",
    "auth/unauthenticated": "未認証です。",
    "auth/user-token-expired": "ユーザートークンの有効期限が切れています。",
    "auth/invalid-user-token": "ユーザートークンが無効です。",
    "auth/network-request-failed": "ネットワーク接続に失敗しました。"
  };

  return messages[code] || `不明なエラーが発生しました。: ${error.message}`;
}

// すべてexportして他ページで使えるように
export {
  auth, db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc,
  translateAuthError
};
