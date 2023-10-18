class AdblockRemover {
    constructor(config) {
        this.adblockerEnabled = config.adblockerEnabled || true;
        this.popupRemoverEnabled = config.popupRemoverEnabled || true;

        this.domainsToRemove = [
            '*.youtube-nocookie.com/*'
        ];

        this.jsonPathsToRemove = [
            'playerResponse.adPlacements',
            'playerResponse.playerAds',
            'adPlacements',
            'playerAds',
            'playerConfig',
            'auxiliaryUi.messageRenderers.enforcementMessageViewModel'
        ];

        this.observerConfig = {
            childList: true,
            subtree: true
        };

        this.unpausedAfterSkip = 0;

        window.__ytplayer_adblockDetected = false;

        if (this.adblockerEnabled) this.addAdblocker();
        if (this.popupRemoverEnabled) this.initializePopupRemover();
        if (this.popupRemoverEnabled) this.initializeObserver();
    }

    initializePopupRemover() {
        this.removeJsonPaths(this.domainsToRemove, this.jsonPathsToRemove);
        setInterval(() => {
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");

            if (popup) {
                document.getElementById("dismiss-button").click();
                document.getElementsByClassName("ytp-play-button ytp-button")[0].click();
                popup.remove();
                if (modalOverlay) modalOverlay.removeAttribute("opened");
                this.unpausedAfterSkip = 2;
            }

            if (!this.unpausedAfterSkip > 0) return;

            if (video1) {
                if (video1.paused) this.unPauseVideo();
                else if (this.unpausedAfterSkip > 0) this.unpausedAfterSkip--;
            }
            if (video2) {
                if (video2.paused) this.unPauseVideo();
                else if (this.unpausedAfterSkip > 0) this.unpausedAfterSkip--;
            }
        }, 1000);
    }

    addAdblocker() {
        setInterval(() => {
            const skipBtn = document.querySelector('.videoAdUiSkipButton, .ytp-ad-skip-button');
            const ad = [...document.querySelectorAll('.ad-showing')][0];
            const sidAd = document.querySelector('ytd-action-companion-ad-renderer');

            if (ad) {
                document.querySelector('video').playbackRate = 10;
                if (skipBtn) {
                    skipBtn.click();
                }
            }

            if (sidAd) {
                sidAd.remove();
            }
        }, 50);
    }

    unPauseVideo() {
        const keyEvent = new KeyboardEvent("keydown", {
            key: "k",
            code: "KeyK",
            keyCode: 75,
            which: 75,
            bubbles: true,
            cancelable: true,
            view: window
        });
        document.dispatchEvent(keyEvent);
        this.unpausedAfterSkip = 0;
    }

    removeJsonPaths(domains, jsonPaths) {
        const currentDomain = window.location.hostname;
        if (!domains.includes(currentDomain)) return;

        jsonPaths.forEach(jsonPath => {
            const pathParts = jsonPath.split('.');
            let obj = window;
            for (const part of pathParts) {
                if (obj.hasOwnProperty(part)) {
                    obj = obj[part];
                } else {
                    break;
                }
            }
            obj = undefined;
        });
    }

    initializeObserver() {
        const observer = new MutationObserver(() => {
            this.removeJsonPaths(this.domainsToRemove, this.jsonPathsToRemove);
        });
        observer.observe(document.body, this.observerConfig);
    }
}

const config = {
    adblockerEnabled: true,
    popupRemoverEnabled: true
};

const adblockRemover = new AdblockRemover(config);