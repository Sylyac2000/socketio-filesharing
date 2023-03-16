(function () {


    let senderID;
    const socket = io();


    //events


    function generateId() {
        return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
    }

    function download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    document.querySelector('#btnconnectoroom').addEventListener('click', (evt) => {
        senderID = document.querySelector('#theroom').value;
        if (senderID === 0) {
            return;
        }
        let joinID = generateId();

        const data = {
            uid: joinID,
            sender_uid: senderID
        };
        socket.emit('receiver-join', data);

        console.log(`receiver joined`, data);

    });

    let fileShare = {};

    socket.on('fs-meta', (data) => {
        fileShare.metadata = data;
        fileShare.transmitted = 0;
        fileShare.buffer = [];

        const elt = document.createElement('div');
        elt.classList.add('item');
        elt.innerHTML = `
            <div class="progress">
                <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
             </div>
            <div class="filename">${data.filename}</div>    
            `;
        document.querySelector('#filelist').appendChild(elt);

        socket.emit('fs-start', {uid: senderID});

    });

    socket.on('fs-share', (buffer) => {
       fileShare.buffer.push(buffer);
       fileShare.transmitted += buffer.byteLength;
        let percent = Math.trunc(fileShare.transmitted / fileShare.metadata.totalbuffersize * 100);
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', percent);
        progressBar.innerText = `${percent}%`;
        if (fileShare.transmitted === fileShare.metadata.totalbuffersize) {
            download(new Blob(fileShare.buffer), fileShare.metadata.filename);
            fileShare = {};
        } else {
            socket.emit('fs-start',{uid: senderID});
        }
    });


    socket.on('init', (uid) => {
        receiverID = uid;
    });
})();
