$(function(){function a(){}function b(b,c){b&&c?(weeknr_volgende=c+1,weeknr_vorige=c-1,$.get("/rooster/"+b+"/"+c,function(d){$(".hetrooster").html(d),$(".js-weeknr-show").text(c),$(".js-klas-show").text(b.replace(/;/g,", ")),$(".js-permalink-toggle").show();var e=appUrl+"/"+b;$(".js-permalink").text(e).attr("href",e),$(".js-alleszien:parent").addClass("show-for-small-only"),history.pushState(null,null,"/"+b+"/"+c),a()})):($(".js-klas").val(""),$(".js-permalink-toggle").hide(),$(".hetrooster").html(""),$("body").removeClass("rooster-actief"),$(".js-weeknr-show").text(weeknr_huidig),$(".js-klas-show").text(""),history.pushState(null,null,"/"))}function c(a){$.get("/"+a,function(a){$(".popup").html(a),$(".popup-achtergrond").fadeIn(200),$(".popup").fadeIn(200)}),$(document).on("keyup",function(a){27===a.keyCode&&d()})}function d(){$(".popup-achtergrond").fadeOut(200),$(".popup").fadeOut(200),$(document).off("keyup")}a(),$(".js-klas").on("input",function(){clearTimeout($(this).data("timer"));var a=$(this);$(this).data("timer",setTimeout(function(){var c=a.val().replace(/\s+/g,"").replace(/,/g,";").toLowerCase();weeknr=weeknr_huidig,klasOrig=c,$("body").addClass("rooster-actief"),b(klasOrig,weeknr_huidig)},400))}),$(".js-vorige").on("click",function(a){a.preventDefault(),weeknr-=1,0===weeknr&&(weeknr=52),b(klasOrig,weeknr)}),$(".js-huidige").on("click",function(a){a.preventDefault(),weeknr=weeknr_huidig,b(klasOrig,weeknr)}),$(".js-volgende").on("click",function(a){a.preventDefault(),weeknr+=1,53==weeknr&&(weeknr=1),b(klasOrig,weeknr)}),$(".js-home").on("click",function(a){a.preventDefault(),b(null,null)}),$(".js-alleszien").on("click",function(a){a.preventDefault(),$(".dag, .js-controls").removeClass("hide-for-small-only"),$(".js-alleszien:parent").hide()}),$(".js-popup").on("click",function(a){a.preventDefault();var b=$(this).attr("href");c(b)}),$(".popup").on("click",".sluit-popup",function(a){a.preventDefault(),d()}),$(".popup").on("click",".cheat-link",function(a){a.preventDefault();var c=$(this).text();weeknr=weeknr_huidig,klasOrig=c,$("body").addClass("rooster-actief"),b(c,weeknr_huidig),$(".js-klas").val(c),d()})});