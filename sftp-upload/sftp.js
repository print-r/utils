// 服务器配置
const server = {
    host: '',
    port: 22,
    username: '',
    password: '',
}
const path = require('path');
const Client = require('ssh2-sftp-client');
const sftp = new Client();
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const localPath = './dist'; // 本地上传路径
const remoteFtpPath = '/www/wwwroot/nyt_fronted'; // 远程FTP目录
const localFiles = [] // 存储本地文件路径
let listFiles = []; // 文件夹目录
let localFileLength = 0; // 上传文件个数
let startTime;
let endTime;
console.log(chalk.green('正在连接服务器...'))
sftp.connect(server).then(() => {
    console.log(chalk.green(`已连接到 ${server.host}`));
    startTime = Date.now();
    action()
}).catch(err => {
    console.log(chalk.red(err.message));
})

// 执行
async function action() {
    // 读取本地文件
    await readingFile();
    // 删除服务器文件
    await deleteFiles();
    // 创建服务器文件夹
    await mkdirFiles()
        // 上传
    upload().then(() => {
        console.log(chalk.green(`上传完成，本次上传${localFiles.length}个文件`));
        console.log(chalk.green(`消耗时间：${(endTime - startTime) / 1000}s`));
        sftp.end();
    })
}

// 获取本地文件
function readingFile() {
    return new Promise((resolve, reject) => {
        readFiles(localPath).catch(err => reject(err));
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
                            const dir = remoteFtpPath + filepath.replace(localPath, '').replace('\\', '/');
                            localFiles.push({
                                dir,
                                remoteFtpPath: dir + '/' + file.name,
                                localPath: path.join(__dirname, filepath + '\\' + file.name),
                                filedata: data
                            })
                            localFileLength = localFiles.length;
                        });
                    } else { // 目录
                        const child_filepath = filepath + '/' + file.name;
                        listFiles.push(
                            child_filepath.replace(localPath, remoteFtpPath)
                        )
                        readFiles(child_filepath);
                    }
                });
            }
        });
    });
}

// 创建文件夹
function mkdirFiles() {
    let step = 0;
    let isAction = false;
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            if (!isAction) {
                isAction = true
                sftp.mkdir(listFiles[step], true).then(res => {
                    step++;
                    isAction = false;
                    if (step > listFiles.length - 1) {
                        clearInterval(timer)
                        resolve();
                    }
                });
            }
        })
    })
}

// 清除服务器文件
function deleteFiles() {
    // dist 文件目录
    let distFiles = fs.readdirSync(localPath);
    return new Promise((resolve, reject) => {
        let step = 0;
        let isAction = false;
        let path = '';
        let timer = setInterval(() => {
            if (!isAction) {
                isAction = true;
                path = `${remoteFtpPath}/${distFiles[step]}`;
                sftp.exists(path).then(status => {
                    if (status) {
                        console.log(chalk.green(`正在清除服务器文件：${distFiles[step]}`));
                        if (status == '-') {
                            // 删除文件
                            sftp.delete(path).then(() => {
                                step++;
                                isAction = false
                            })
                        } else {
                            // 删除文件夹
                            sftp.rmdir(path, true).then(() => {
                                step++;
                                isAction = false
                            })
                        }
                    } else {
                        isAction = false
                        step++;
                    }
                    if (step > distFiles.length - 1) {
                        clearInterval(timer)
                        resolve(step)
                        console.log(chalk.green('服务器文件清除完成'));
                    }
                })
            }
        })
    })
}

// 上传
function upload() {
    let isUpload;
    let step = 0;
    let isAction = false;
    return new Promise((resolve, reject) => {
        isUpload = ora(chalk.green('正在上传，请稍后...'))
        isUpload.start()
        let timer = setInterval(() => {
            if (!isAction) {
                isAction = true;
                sftp.fastPut(localFiles[step].localPath, localFiles[step].remoteFtpPath).then(() => {
                    isAction = false;
                    if (step >= localFileLength - 1) {
                        clearInterval(timer)
                        isUpload.stop()
                        endTime = Date.now();
                        resolve()
                    }
                    step++;
                })
            }
        })
    })
}