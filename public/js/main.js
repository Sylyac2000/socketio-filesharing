(function () {
    const fileinput = document.getElementById('fileinput');
    const uploadbtn = document.getElementById('uploadbtn');

    let receiverID;
    const socket = io();

    const progressBar = document.querySelector('.progress-bar');
    //events


    uploadbtn.addEventListener('click', (evt) => {
        console.log('salam click');
        fileinput.click();
    });
    fileinput.addEventListener('change', (evt) => {
        // Handle the file upload here
        let file = evt.target.files[0];

        if (!file) {
            return;
        }
        const filereader = new FileReader();
        filereader.onload = (evt) => {
            let buffer = new Uint8Array(filereader.result);
            // console.log(buffer);
            const elt = document.createElement('div');
            elt.classList.add('item');
            elt.innerHTML = `
            
             <div class="progress">
                <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
             </div>
            <div class="filename">${file.name}</div>    
            `;
            document.querySelector('#filelist').appendChild(elt);
            const datafile = {
                filename: file.name,
                totalbuffersize: buffer.length,
                buffersize: 1024
            };
            shareFile(datafile, buffer, elt.querySelector('.progress-bar'));
        };
        filereader.readAsArrayBuffer(file);
    });

    function generateId() {
        return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
    }

    function shareFile(metadata, buffer, progessnode) {
        let data = {
            uid: receiverID,
            metadata: metadata
        };
        socket.emit('file-meta', data);

        console.log('shareFile');

        socket.on('fs-share', ()=>{
            let chunck = buffer.slice(0, metadata.buffersize);
            buffer = buffer.slice(metadata.buffersize, buffer.length);
            let percent = Math.trunc((metadata.totalbuffersize - buffer.length) / metadata.totalbuffersize * 100)
            progessnode.style.width = `${percent}%`;
            progessnode.setAttribute('aria-valuenow', percent);
            progessnode.innerText = `${percent}%`;
            // progessnode.innerText = Math.trunc((metadata.totalbuffersize - buffer.length) / metadata.totalbuffersize * 100) + '%'
            if(chunck.length !== 0) {
                data = {
                    uid: receiverID,
                    buffer: chunck
                }
                socket.emit('file-raw', data);
            }
        });
    }

    document.querySelector('#btncreateroom').addEventListener('click', (evt) => {
        let joinID = generateId();
        document.querySelector('#theroom').innerHTML = `
            <b>${joinID}</b>
        `;

        const data = {
            uid: joinID
        };
        socket.emit('sender-join', data);

    });

    socket.on('init', (uid) => {
        receiverID = uid;
    });
})();
