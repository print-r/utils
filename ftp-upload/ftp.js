'use strict'
// 服务器配置
const server = {
    host: '',
    port: 21,
    user: '',
    password: '',
}
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const FTPClient = require('ftp');
const dirPath = './dist'; // 本地上传路径
const remoteFtpPath = '/www/wwwroot/nyt_fronted'; // 远程FTP目录
const localFiles = []; // 本地文件
let localFileLength = 0; // 上传文件个数
let ftp = null;
let isUpload = null;
let startTime;
let endTime;
readingFile().then(() => {
    if (localFileLength) {
        console.log(chalk.green('正在连接服务器...'))
        ftp = new FTPClient();
        ftp.on('ready', () => {
            startTime = Date.now();
            console.log(chalk.green(`已连接到 ${server.host}`));
            // 清理文件夹
            deleteFiles().then(() => {
                uploadingFile().then(() => {
                    console.log(chalk.green(`上传完成，本次上传${localFiles.length}个文件`));
                    console.log(chalk.green(`消耗时间：${(endTime - startTime) / 1000}s`));
                }).catch(err => {
                    console.log(err);
                })
            })
        });
        // 连接服务器
        ftp.connect({
            ...server,
            connTimeout: 1000 * 10, // 连接超时时间
            pasvTimeout: 1000 * 10, // PASV data 连接超时时间
            keepalive: 1000 * 10, // 多久发送一次请求，以保持连接
        });
    } else {
        console.log(chalk.red('本地文件为空，取消上传'));
    }
}).catch(err => {
    console.log(err);
});

// 正在获取本地文件
function readingFile() {
    return new Promise((resolve, reject) => {
        readFiles(dirPath).catch(err => reject(err));
        // 判断是否读取完毕（1s内 localFiles长度不再变化）
        let timer = setInterval(() => {
            if (localFileLength == localFiles.length) {
                clearInterval(timer);
                resolve();
            }
        }, 1000);
    })
}
// 递归读取文件
function readFiles(filepath) {
    return new Promise((resolve, reject) => {
        fs.readdir(filepath, { withFileTypes: true }, (err, files) => {
            if (err) throw err;
            if (files.length > 0) {
                files.map(file => {
                    if (file.isFile()) { // 文件
                        const child_filepath = filepath + '/' + file.name;
                        fs.readFile(child_filepath, (err, data) => {
                            if (err) throw err;
                            const dir = remoteFtpPath + filepath.replace(dirPath, '').replace('\\', '/');
                            localFiles.push({
                                dir,
                                filepath: dir + '/' + file.name,
                                filedata: data
                            })
                            localFileLength = localFiles.length;
                        });
                    } else { // 目录
                        const child_filepath = filepath + '/' + file.name;
                        readFiles(child_filepath);
                    }
                });
            }
        });
    });
}

// 正在上传文件
function uploadingFile() {
    return new Promise((resolve, reject) => {
        isUpload = ora(chalk.green('正在上传，请稍后...'))
        isUpload.start()
        localFiles.map(file => {
            uploadFiles(file.dir, file.filepath, file.filedata)
                .then(res => {
                    if (res == 0) {
                        resolve();
                        isUpload.stop()
                        endTime = Date.now();
                    }
                })
                .catch(err => reject(err));
        })
    })
}
// 覆盖上传文件
function uploadFiles(dir, filepath, filedata) {
    return new Promise((resolve, reject) => {
        ftp.mkdir(dir, true, err1 => {
            if (err1) reject(err1);
            ftp.put(filedata, filepath, err2 => {
                if (err2) reject(err2);
                localFileLength--;
                ftp.end();
                resolve(localFileLength);
            });
        })
    })
}

// 清除服务器文件
function deleteFiles() {
    // dist 文件目录
    let distFiles = fs.readdirSync(dirPath);
    return new Promise((resolve, reject) => {
        let step = 0;
        let isAction = false;
        let timer = setInterval(() => {
            if (!isAction) {
                console.log(chalk.green(`正在清除服务器文件：${distFiles[step]}`));
                isAction = true;
                ftp.rmdir(`${remoteFtpPath}${distFiles[step]}`, true, err => {
                    isAction = false;
                    if (step >= distFiles.length - 1) {
                        clearInterval(timer)
                        resolve(step)
                        console.log(chalk.green('服务器文件清除完成'));
                    }
                    step++;
                });
            }
        }, 100)
    })
}