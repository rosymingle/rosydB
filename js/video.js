// video14.js Updated on 02/06/2025 - Adpative Streaming + Eager Transformation

const cldPlayer = "https://cdn.jsdelivr.net/npm/cloudinary-video-player@2.3.3/dist/cld-video-player.min.js";
const videoJS = "https://vjs.zencdn.net/8.5.2/video.min.js";
const hlsPlugin = "https://cdn.jsdelivr.net/npm/videojs-contrib-hls@5.15.0/dist/videojs-contrib-hls.min.js";
// q_auto options
const qualityValues = ["best", "good", "eco", "low"];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
	script.setAttribute("crossorigin", "anonymous"); 
	script.setAttribute("referrerpolicy","no-referrer");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadScriptsInOrder() {
  try {
    console.log('Starting to load VideoJS');
    await loadScript(videoJS);
    console.log('VideoJS loaded successfully');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (typeof videojs === 'undefined') {
      throw new Error('Video.js failed to initialize properly');
    }
    
    
    console.log('Starting to load HLS plugin');
    await loadScript(hlsPlugin);
    console.log('HLS plugin loaded successfully');
    
    // Additional initialization can go here
  } catch (error) {
    console.error('Script loading failed:', error);
  }
}

$(document).ready(function () {

	/* Start: CONVERT OLD SNIPPET */
	if ($(".video[data-pid]").length > 0 ) {
		
		$(".video").each(function () {
			const videoOld = $(this);
	  
			const desktopSource = videoOld.attr("data-pid");
			const mobileSource = videoOld.attr("m-data-pid");
			const tabletSource = videoOld.attr("t-data-pid");
	  
			const mbRatio = videoOld.attr("m-data-ratio");
			const dtRatio = videoOld.attr("data-ratio");
			const tbRatio = videoOld.attr("t-data-ratio");
	  
			const videoQuality =
			  videoOld.attr("quality") || videoOld.attr("data-quality");
	  
			if (videoOld.is(".in-situ")) {
			  const videoCover = videoOld.html();
	  
			  const endByPoster = videoOld.hasClass("poster-end");
	  
			  videoOld.replaceWith(`<div class="video in-situ video-area">
					  <div class="in-situ-cover pointer">${videoCover}</div>
					  <video 
					  controls
					  class="in-situ og-snippet cld-video-player cld-fluid ${
				endByPoster ? "poster-end" : ""
			  }"
					  data-pid=${desktopSource}
					  data-ratio=${dtRatio}
					  ${mobileSource ? `m-data-pid=${mobileSource}` : ""}
					  ${mbRatio ? `m-data-ratio=${mbRatio}` : ""}
					  ${tabletSource ? `t-data-pid=${tabletSource}` : ""}
					  ${tbRatio ? `t-data-ratio=${tbRatio}` : ""}
					  ${videoQuality ? `quality=${videoQuality}` : 'quality="auto"'}>
					  </video>
					  
					  </div>`);
			} else if (videoOld.is(".popup")) {
			  const popupCTA = videoOld.html();
			  const className = $.trim(
				`${videoOld.hasClass("cta-border") ? "cta-border" : ""} ${
				  videoOld.hasClass("cta-ul") ? "cta-ul" : ""
				} ${videoOld.hasClass("cta-solid") ? "cta-solid" : ""} ${
				  videoOld.hasClass("cta-arrow") ? "cta-arrow" : ""
				}`
			  );
	  
			  videoOld.replaceWith(`<div class="video popup video-area">
					  <a class="${className}"
					  href="#">${popupCTA}</a>
					  <video 
					  controls
					  class="popup og-snippet cld-video-player cld-fluid disp-no"
					  data-pid=${desktopSource}
					  data-ratio=${dtRatio}
					  ${mobileSource ? `m-data-pid=${mobileSource}` : ""}
					  ${mbRatio ? `m-data-ratio=${mbRatio}` : ""}
					  ${tabletSource ? `t-data-pid=${tabletSource}` : ""}
					  ${tbRatio ? `t-data-ratio=${tbRatio}` : ""}
					  ${videoQuality ? `quality=${videoQuality}` : 'quality="auto"'}>
					  </video>
					  </div>`);
			} else if (videoOld.is(".autoplay")) {
			  videoOld.replaceWith(`<div class="video autoplay video-area">
					  <video 
					  autoplay
					  muted
					  loop
					  loading="lazy"
					  playsinline
					  webkit-playsinline
					  class="autoplay og-snippet cld-video-player cld-fluid"
					  data-pid=${desktopSource}
					  data-ratio=${dtRatio}
					  ${mobileSource ? `m-data-pid=${mobileSource}` : ""}
					  ${mbRatio ? `m-data-ratio=${mbRatio}` : ""}
					  ${tabletSource ? `t-data-pid=${tabletSource}` : ""}
					  ${tbRatio ? `t-data-ratio=${tbRatio}` : ""}
					  ${videoQuality ? `quality=${videoQuality}` : 'quality="auto"'}>
					  </video>
					  </div>`);
			} else {
			  videoOld.replaceWith(`<div class="video video-area">
					  <video 
					  controls
					  loading="lazy"
					  class="og-snippet cld-video-player cld-fluid"
					  data-pid=${desktopSource}
					  data-ratio=${dtRatio}
					  ${mobileSource ? `m-data-pid=${mobileSource}` : ""}
					  ${mbRatio ? `m-data-ratio=${mbRatio}` : ""}
					  ${tabletSource ? `t-data-pid=${tabletSource}` : ""}
					  ${tbRatio ? `t-data-ratio=${tbRatio}` : ""}
					  ${videoQuality ? `quality=${videoQuality}` : 'quality="auto"'}>
					  </video>
					  </div>`);
	  
			  console.log("Replace Success");
			}
		  });
		  
	}/* End: CONVERT OLD SNIPPET */

	
	
	// Pending: might be better to remove the cloudinary Object checking 
	if ( $("video[data-pid]").length > 0 && typeof cloudinary === 'undefined')  {

		document.head.innerHTML += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cloudinary-video-player@2.3.3/dist/cld-video-player.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />';
		
		//load video.js & HLS in order
		loadScriptsInOrder();

		// Loading Cloudinary Video Player asynchronously
		loadScript(cldPlayer)
		.then(() => {
			console.log("Cloudinary video player loaded successfully");
			/* Initialize your video player here */

			/* NEW Cloudinary JS embed plugin */
			$("video").each(function () {
				var video = $(this);
		
				let random = Math.floor(Math.random() * 10000);
				const id = `video${random}`;
				video.attr("id", id);
		

				const commonConfig = {
					cloud_name: "david-jones",
					secure: true,
					analytics: true,
					logoOnclickUrl: "#",
					logoImageUrl: "null",
					controls: true
				  };
				  
				  // Initialize player with conditional property for in-situ videos
				  const vplayer = cloudinary.videoPlayer(id, {
					...commonConfig,
					bigPlayButton: video.is(".in-situ") ? false : true
				  });
		
				/* IN-SITU: DESKTOP, MOBILE & TABLET */
				const mobileSource = video.attr("m-data-pid");
				const desktopSource = video.attr("data-pid");
				const tabletSource = video.attr("t-data-pid");
		
				if (desktopSource.length > 0) {
				const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		
				const mobilePoster = video.attr("m-data-poster");
				const tabletPoster = video.attr("t-data-poster");
				const desktopPoster = video.attr("data-poster");
		
				let poster = {};
		
				const mbRatio = video.attr("m-data-ratio");
				const tbRatio = video.attr("t-data-ratio");
				const dtRatio = video.attr("data-ratio");
		
				let videoRatio = "";
				let source;
		
				if (viewportWidth < 768) {
					source = mobileSource ? mobileSource : desktopSource;
					console.log("MOBILE SOURCE:", source);
					poster = {
					poster: mobilePoster
						? `https://res.cloudinary.com/david-jones/image/upload/v1687498676/${mobilePoster}.jpg`
						: null,
					};
		
					videoRatio = mbRatio ? mbRatio : "";
				}
		
				if (viewportWidth >= 768 && viewportWidth <= 1024) {
					source = tabletSource ? tabletSource : desktopSource;
					console.log("TABLET SOURCE:", source);
					poster = {
					poster: tabletPoster
						? `https://res.cloudinary.com/david-jones/image/upload/v1687498676/${tabletPoster}.jpg`
						: null,
					};
		
					videoRatio = tbRatio ? tbRatio : "";
				}
		
				if (viewportWidth > 1024) {
					source = desktopSource;
					poster = {
					poster: desktopPoster
						? `https://res.cloudinary.com/david-jones/image/upload/v1687498676/${desktopPoster}.jpg`
						: null,
					};
		
					videoRatio = dtRatio ? dtRatio : "";
				}
				
                //Implement Adpative Streaming
				vplayer.source(source, { transformation:  {streaming_profile: "auto"}, sourceTypes: ['hls','dash','mp4'], fallback: true, eager_async: true, useUrlGeneration: false  }, poster);

		
				const aspect = videoRatio.split(":");
				const mVidRatio = (aspect[1] / aspect[0]) * 100;
		
				document.getElementById(id).style.paddingTop = `${mVidRatio}%`;
				}
		
				/* The video selector here is the actual generated <video> tag */
				//console.log('After',video);
				//console.log(video[0]);
			});
			/* End: New Plugin */

			/* POP UP */
			const popupWrapper = $("div.popup.cld-video-player");
			if(popupWrapper.length > 0) {
				popupWrapper.each(function () {
					const popupTriggerContainer = $(this).closest(".video-area");
					const popupID = $(this).attr("id");
			
					/* create popup */
					$("body").append(
					'<div class="videoPopup-' +
						popupID +
						' eacss" style="display:none;z-index:99;"><div class="pos-f pad-70 m-pad-40 bg-black-50" style="top:0;right:0;bottom:0;left:0;z-index:99;"><div class="wrapper-1200 m-wrapper-400 pos-r mrgn-lr-a"><a class="icon icon-budicon-1 pointer pos-a-tr white fs-25 pad-r-5" style="z-index: 99; margin-right: -40px;"></a></div></div></div>'
					);
					/* move video into popup */
					$(this).appendTo(".videoPopup-" + popupID + " .pos-r");
                    $(this).show();
					console.log(popupID, "is popped");
			
					const closeBtn = $(".videoPopup-" + popupID).find(".icon-budicon-1");
					const media = document.getElementById(`${popupID}_html5_api`);
			
					/* Start: Auto popup by URL param */
					let urlParams = window.location.search;
					urlParams = new URLSearchParams(urlParams);
					const videoPopupLayer = $(".videoPopup-" + popupID);
			
					const isAutoPop = urlParams.get("autopop") === "true" ? true : false;
					const isAutoPlay = urlParams.get("autoplay") === "true" ? true : false;
			
					if (isAutoPop && media) {
					videoPopupLayer.toggle();
			
					/* 1.The muted only works when it's triggered by the window.onload event 
							2.The autoplay only works when the media.play() is added.
							3.The "function(){}" here cannot be replaced with the "arrow func => " 
						*/
					if (isAutoPlay) {
						window.onload = function () {
						media.muted = true;
						media.autoplay = true;
						media.play();
						};
					}
					}
					/* End: Auto Popup */
			
					popupTriggerContainer.click(() => {
					$(".videoPopup-" + popupID).toggle();
					media.play();
					return false;
					});
			
					closeBtn.click(() => {
					media.pause();
					$(".videoPopup-" + popupID).toggle();
					media.currentTime = 0;
					return false;
					});
				});
			}
			

			/* End: POP UP */

			/* Start: Fallback in-situ execute */
			const inSituVideo = $(".og-snippet.cld-video-player.in-situ");
			if (inSituVideo.length > 0) { 
				inSituVideo.each(function () {
					const convertedVdPoster = $(this)
					.closest(".video-area")
					.find(".in-situ-cover");
					if (convertedVdPoster.length) {
					$(this).hide();
			
					convertedVdPoster.click(() => {
						convertedVdPoster.hide();
						$(this).fadeIn(200);
						$(this).find("video").get(0).play();
					});
			
					//Revert the poster when the video is finished
					if ($(this).hasClass("poster-end")) {
						$(this)
						.find("video")
						.get(0)
						.addEventListener("ended", () => {
							$(this).fadeOut(100);
							convertedVdPoster.show();
						});
					}
					}
				});

			}
			/* End: Fallback in-situ execute */

			/* Start: Autoplay iPhone */
			const autoPlayers = $("div.autoplay.cld-video-player");
			const isIPhone = () => {
				return (
				  /iPhone/i.test(navigator.userAgent) || 
				  $("body").hasClass("iphone")
				);
			  };
			  
			if (isIPhone()) {
				$("video").each(function () {
				$(this).show();
				});

				if(autoPlayers.length >0) {
					autoPlayers.each(function () {
						const autoplayID = $(this).attr("id");
						const media = document.getElementById(`${autoplayID}_html5_api`);
						media.play();
						});
				}
				
			}
			/* End: Autoplay iPhone */

			/* Start: Change Quality Level  */
			setTimeout(() => {
				$("video").each(function () {
				var video = $(this);
				const videoSrc = video.attr("src");
				let quality = video.attr("quality");
				
				if (typeof quality !== "undefined" && qualityValues.includes(quality) && quality !== "eco") {
					let newURL = `upload/q_auto:${quality}/f_auto:video`;
					let newSrc = videoSrc.replace("upload", newURL);
					video.attr("src", newSrc);
				}
				
				});
			}, 1000);
			/* End: Change Quality Level */
			
		})
		.catch((error) => {
			console.error("Failed to load Cloudinary video player:", error);
		});

		
		

		
	}

	

});
