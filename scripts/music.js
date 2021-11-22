window.onload = function() 
{
    // on load saat website dibuka
    text_shadow_visualizer();  
}

// deteksi mobile dan tablet browser
// http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
var mobile_and_tablet_check = function() 
{
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

// fungsi utama
var text_shadow_visualizer = function(audio, elem, audioData) 
{
    var main_text = document.getElementById("main_music_text");
    if ((!window.AudioContext && !window.webkitAudioContext) || mobile_and_tablet_check()) 
    {
        // gagal mendapatkan context atau device adalah mobile device
        main_text.style['color'] = 'white';
        return;
    }

    // membuat audio object baru
    var music = new Audio; // <audio src="...">
    music.setAttribute("src", "assets/bgm.mp3")
    music.loop = true;

    // membuat audio context baru
    var audio_context = new (window.AudioContext || window.webkitAudioContext)();
    var audio = audio_context.createMediaElementSource(music);
    var analyser = audio_context.createAnalyser();
    analyser.fftSize = 2048;
    audio.connect(analyser);
    audio.connect(audio_context.destination);	

    // auto play music ketika mouse digerakkan
    document.body.addEventListener("mousemove", function () 
    {
        music.play();
        audio_context.resume();
    });

    // mendapatkan object canvas
    var canvas_object = document.getElementById("main_music_canvas");
    canvas_object.width = canvas_object.clientWidth;
    canvas_object.height = canvas_object.clientHeight;
    var canvas_context = canvas_object.getContext("2d");

    // cek data ketika resize
    window.addEventListener("resize", function() 
    {
        canvas_object.width = canvas_object.clientWidth;
        canvas_object.height = canvas_object.clientHeight;
    });

    // membuat array data
    var data_array = analyser.getFloatTimeDomainData 
        ? new Float32Array(analyser.fftSize) 
        : new Uint8Array(analyser.fftSize);
    var frequency_data_array = new Uint8Array(analyser.frequencyBinCount);

    // cek interval
    var then = Date.now();
    var now, delta;
    var interval = 1000 / 30; // 30 FPS interval

    function draw() 
    {
        // callback untuk menggambar effect
        next_draw = requestAnimationFrame(draw);

        // cek waktu, return jika kurang dari interval
        now = Date.now();
        delta = now - then;
        if (delta <= interval) return;
        
        // mendapatkan data domain
        // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatTimeDomainData
        if (analyser.getFloatTimeDomainData) 
        {
            analyser.getFloatTimeDomainData(data_array);
        } 
        else 
        {
            analyser.getByteTimeDomainData(data_array);
        }

        // menghitung average sample
        // https://www.izotope.com/en/learn/digital-audio-basics-sample-rate-and-bit-depth.html
        var sample_average = 0;
        for (var i = 0; i < data_array.length; i++) 
        {
            sample_average += analyser.getFloatTimeDomainData 
                ? Math.abs(data_array[i])
                : Math.abs(data_array[i] - 128) / 128;
        }
        sample_average /= data_array.length;

        // kalkulasi bayangan
        var shadow = 1 * (Math.exp(sample_average) - 1);
        var shadow_inner = 1 * (Math.exp(sample_average / 2) - 1);

        // apply style css
        main_text.style['text-shadow'] = "0px 0px " + shadow + "em rgba(255, 138, 198, 0.25), 0px 0px " + shadow_inner + "em #f00";

        // mendapatkan frequency data
        // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
        analyser.getByteFrequencyData(frequency_data_array);

        // membersihkan canvas
        canvas_context.clearRect(0, 0, canvas_object.width, canvas_object.height);

        // mendapatkan canvas bar
        var text_canvas = document.createElement('canvas');
        text_canvas.width = canvas_object.width;
        text_canvas.height = canvas_object.height;

        // set context canvas bar
        text_canvas_context = text_canvas.getContext("2d");
        text_canvas_context.fillStyle = "rgba(255, 138, 198, 1)";
        text_canvas_context.font = "bold 240px sans-serif";
        text_canvas_context.textAlign = "center";

        // kalukasi ukuran
        var text_to_draw = main_text.innerHTML;
        var text_info = text_canvas_context.measureText(text_to_draw);

        // menggambar text
        text_canvas_context.fillText(text_to_draw, canvas_object.width / 2, 220);

        // ukuran menghitung bar
        var true_width = text_info.width - 30;
        var frequency_data_array_shown_length = frequency_data_array.length * (16 / 22); // cek mp3 di atas 16khz
        var bar_width = true_width / frequency_data_array_shown_length;
        var bar_height;
        var current_x = 0;

        // membersihkan canvas
        canvas_context.drawImage(text_canvas, 0, 0);
        canvas_context.globalAlpha = .2;

         // menggambar bar
        for (i = 0; i < frequency_data_array_shown_length; i++) 
        {
            bar_height = frequency_data_array[i] / 2;
            canvas_context.fillStyle = 'rgba(' + Math.floor(bar_height + 100) + ', 50, 50, 1)';
            canvas_context.fillRect((canvas_object.width - true_width) / 2 + current_x, 225 - bar_height * 1, bar_width, bar_height * 1);
            current_x += bar_width;
        }

        // cleanup
        canvas_context.globalAlpha = 1;
        canvas_context.globalCompositeOperation = 'destination-in';
        canvas_context.drawImage(text_canvas, 0, 0);
        canvas_context.globalCompositeOperation = 'source-over';

        // kalkulasi delta waktu
        then = now - (delta % interval);
    }

    // mulai menggambar effect
    draw();
};