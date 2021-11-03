let TYPE_TEXT = "TEXT";
let TYPE_URL = "URL";
let TYPE_PHONE = "PHONE NUMBER";
let TYPE_WIFI = "WIFI";
let TYPE_UPI = "UPI";

//#region banner
function showBanner(message, isSuccessMessage) {
    hideBanners();
    selector = ".banner.success";
    textId = "banner-success-message";
    if (isSuccessMessage === false) {
        selector = ".banner.error";
        textId = "banner-error-message";
    }

    document.getElementById(textId).innerText = message;
    requestAnimationFrame(() => {
        const banner = document.querySelector(selector);
        banner.classList.add("visible");
    });
};
  
function hideBanners(e) {
    document
        .querySelectorAll(".banner.visible")
        .forEach((b) => b.classList.remove("visible"));
};

function shareResult(decodedText, decodedResultType) {
    const shareData = {
        title: "Scan result from Scanapp.org",
        text: decodedText,
    };

    if (decodedResultType == TYPE_URL) {
        shareData.url = decodedText;
    }

    navigator.share(shareData).then(function() {
        showBanner("Shared successfully");
    }).catch(function(error) {
        showBanner("Sharing cancelled or failed", false);
    });
}
//#endregion

//#region TYPE UI
function createLinkTyeUi(parentElem, decodedText, type) {
    var link = document.createElement("a");
    link.href = decodedText;
    if (type == TYPE_PHONE) {
        decodedText = decodedText.toLowerCase().replace("tel:", "");
    }
    link.innerText = decodedText;
    parentElem.appendChild(link);
}

function addKeyValuePairUi(parentElem, key, value) {
    var elem = document.createElement("div");
    var keySpan = document.createElement("span");
    keySpan.style.fontWeight = "bold";
    keySpan.style.marginRight = "10px";
    keySpan.innerText = key;
    elem.appendChild(keySpan);

    var valueSpan = document.createElement("span");
    valueSpan.innerText = value;
    elem.appendChild(valueSpan);

    parentElem.appendChild(elem);
}

function createWifiTyeUi(parentElem, decodedText) {
    var expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
    var regexExp = new RegExp(expression);
    var result = regexExp.exec(decodedText);
    addKeyValuePairUi(parentElem, "SSID", result[1]);
    addKeyValuePairUi(parentElem, "Type", result[2]);
    addKeyValuePairUi(parentElem, "Password", result[3]);
}

function createUpiTypeUi(parentElem, decodedText) {
    // var expression = /upi:\/\/pay\?cu=(.*)&pa=(.*)&pn=(.*)/g;
    // var regexExp = new RegExp(expression);
    // var result = regexExp.exec(decodedText);
    var upiUri = new URL(decodedText);
    var searchParams = upiUri.searchParams;
    var cu = searchParams.get("cu");
    if (cu && cu != null) {
        addKeyValuePairUi(parentElem, "Currency", cu);
    }
    addKeyValuePairUi(
        parentElem, "Payee address", searchParams.get("pa"));

    var pn = searchParams.get("pn");
    if (pn && pn != null) {
        addKeyValuePairUi(parentElem, "Payee Name", pn);
    }
}
//#endregion

//#region type detection
function isUrl(decodedText) {
    var expression1 = /^((javascript:[\w-_]+(\([\w-_\s,.]*\))?)|(mailto:([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+@([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)|(\w+:\/\/(([\w\u00C0-\u1FFF\u2C00-\uD7FF-]+\.)*([\w\u00C0-\u1FFF\u2C00-\uD7FF-]*\.?))(:\d+)?(((\/[^\s#$%^&*?]+)+|\/)(\?[\w\u00C0-\u1FFF\u2C00-\uD7FF:;&%_,.~+=-]+)?)?(#[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)?))$/g;
    var regexExp1 = new RegExp(expression1);
    if (decodedText.match(regexExp1)) {
       return true;
    }

    var expression2 = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    var regexExp2 = new RegExp(expression2);

    if (decodedText.match(regexExp2)) {
       return true;
    }
    return false;
}

function isPhoneNumber(decodedText) {
    var expression = /tel:[+]*[0-9]{3,}/g;
    var regexExp = new RegExp(expression);
    return decodedText.match(regexExp);
}

function isWifi(decodedText) {
    var expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
    var regexExp = new RegExp(expression);
    return decodedText.match(regexExp);  
}

function isUpi(decodedText) {
    var upiUri = new URL(decodedText);
    if (!upiUri || upiUri == null) {
        return false;
    }
    return upiUri.protocol === "upi:";
}

function detectType(decodedText) {
    if (isUrl(decodedText)) {
        return TYPE_URL;
    }

    if (isPhoneNumber(decodedText)) {
        return TYPE_PHONE;
    }

    if (isWifi(decodedText)) {
        return TYPE_WIFI;
    }

    if (isUpi(decodedText)) {
        return TYPE_UPI;
    }

    return TYPE_TEXT;
}
//#endregion

//#region Actions
function copyToClipboard(decodedText) {
    navigator.clipboard.writeText(decodedText)
        .then(function() {
            showBanner("Text copied");
        }).catch(function(error) {
            showBanner("Failed to copy", false);
        });
}
//#endregion

/** UI for the scan app results */
let QrResult = function(onCloseCallback) {
    let container = document.getElementById("new-scanned-result");
    let scanResultCodeType = document.getElementById("scan-result-code-type");
    let scanResultImage = document.getElementById("scan-result-image");
    let scanResultText = document.getElementById("scan-result-text");
    let scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    let scanResultParsed = document.getElementById("scan-result-parsed");
    let actionShareImage = document.getElementById("action-share");
    let actionCopyImage = document.getElementById("action-copy");
    let actionPaymentImage = document.getElementById("action-payment");
    let scanResultClose = document.getElementById("scan-result-close");
    let noResultContainer = document.getElementById("no-result-container");

    // TODO(mebjas): fix -- scanResultImage --
    scanResultImage.style.display = "none";

    let lastScan = {
        text: null,
        type: null,
    };

    /** ---- listeners ---- */
    scanResultClose.addEventListener("click", function() {
        hideBanners();
        container.style.display = "none";
        if (onCloseCallback) {
            ga('send', 'event', 'ScanRestart', '', scanResultClose);
            onCloseCallback();
        }

        noResultContainer.classList.remove("hidden");
    });

    actionCopyImage.addEventListener("click", function() {
        hideBanners();
        copyToClipboard(scanResultText.innerText);
    });

    actionPaymentImage.addEventListener("click", function(event) {
        hideBanners();
        var upiLink = decodeURIComponent(lastScan.text);
        location.href = upiLink;

        showBanner("Payment action only works if UPI payment apps are installed.")
    });

    if (navigator.share) {
        actionShareImage.addEventListener("click", function() {
            hideBanners();
            shareResult(lastScan.text, lastScan.type);
        });
    } else {
        actionShareImage.style.display = "none";
    }

    function toFriendlyCodeType(codeType) {
        return codeType;
    }

    function createParsedResult(decodedText, type) {
        let parentElem = document.createElement("div");
        // Action image changes
        if (type == TYPE_UPI) {
            actionPaymentImage.style.display = "inline-block";
        } else {
            actionPaymentImage.style.display = "none";
        }

        if (type == TYPE_URL || type == TYPE_PHONE) {
            createLinkTyeUi(parentElem, decodedText, type);
            return parentElem;
        }

        if (type == TYPE_WIFI) {
            createWifiTyeUi(parentElem, decodedText);
            return parentElem;
        }

        if (type == TYPE_UPI) {
            createUpiTypeUi(parentElem, decodedText);
            return parentElem;
        }

        parentElem.innerText = decodedText;
        return parentElem;
    }

    this.__onScanSuccess = function(decodedText, decodedResult) {
        noResultContainer.classList.add("hidden");

scanResultCodeType.innerText = toFriendlyCodeType(decodedResult.result.format.formatName);
        scanResultText.innerText = decodedText;
        let codeType = detectType(decodedText);

        lastScan.text = decodedText;
        lastScan.type = codeType;

scanResultBadgeBody.innerText = codeType;
        scanResultParsed.replaceChildren();
        scanResultParsed.appendChild(createParsedResult(decodedText, codeType));
        container.style.display = "block";

        // var cha = localStorage.getItem('balance')+localStorage.getItem('topup');
		// localStorage.setItem('balance', cha);	

        window.location.replace(decodedText);
    }
}

QrResult.prototype.onScanSuccess = function(decodedText, decodedResult) {
    this.__onScanSuccess(decodedText, decodedResult);
}

/** other global functions */
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function() {
    location.href = "#reader";
	let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: {width: 250, height: 250},
            // Important notice: this is experimental feature, use it at your
            // own risk. See documentation in
            // mebjas@/html5-qrcode/src/experimental-features.ts
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            rememberLastUsedCamera: true,
            aspectRatio: 1.7777778
        });

    let qrResultHandler = new QrResult(function() {
        if (html5QrcodeScanner.getState() 
            === Html5QrcodeScannerState.PAUSED) {
            html5QrcodeScanner.resume();
        }
    });

    function onScanSuccess(decodedText, decodedResult) {
        if (html5QrcodeScanner.getState() 
            !== Html5QrcodeScannerState.NOT_STARTED) {
            html5QrcodeScanner.pause();
        }

        let scanType = "camera";
        if (html5QrcodeScanner.getState() 
            === Html5QrcodeScannerState.NOT_STARTED) {
            scanType = "file";
        }
        qrResultHandler.onScanSuccess(decodedText, decodedResult);
        ga('send', 'event', 'Scan', 'Success', scanType);
    }
	html5QrcodeScanner.render(onScanSuccess);

    ga('send', 'event', 'Scan', 'Start');
});