#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
项目服务统一启动器 (Project Services Unified Launcher)

使用方法:
    python start.py            # 正常启动
    python start.py --help     # 显示帮助信息
    python start.py --no-check # 跳过环境检查直接启动



作者: YSKZ
最后编写日期: 2025-04-28
版本: 1.0.0 bate
"""

import os
import sys
import subprocess
import signal
import time
import shutil
import platform
import atexit
import re
import argparse
import logging
from datetime import datetime
import requests
import zipfile
import tarfile
import io
import json
from pathlib import Path
import urllib.request
import tempfile

# 检查是否为Windows系统
IS_WINDOWS = platform.system() == "Windows"

# Node.js和npm可执行文件的路径，将在check_nodejs函数中设置
NODE_EXE = None
NPM_EXE = None

# 存储子进程
processes = []

# 项目路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

# 配置日志
LOG_DIR = os.path.join(BASE_DIR, "logs")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, f"launcher_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("launcher")

# 颜色定义
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def create_npm_command(npm_exe, node_exe, *args):
    """
    根据操作系统创建正确的npm命令

    参数:
        npm_exe: npm可执行文件路径
        node_exe: Node.js可执行文件路径
        *args: npm命令的参数

    返回:
        dict: 包含命令数组、shell设置和环境变量的字典
    """
    # 准备环境变量字典
    env = os.environ.copy()
    
    if IS_WINDOWS:
        # Windows下直接执行npm.cmd
        command = [npm_exe] + list(args)
        shell_setting = True  # Windows下需要shell=True来执行批处理文件
        
        # 将node.exe所在目录添加到PATH环境变量
        nodejs_dir = os.path.dirname(node_exe)
        if nodejs_dir not in env.get('PATH', ''):
            env['PATH'] = nodejs_dir + os.pathsep + env.get('PATH', '')
        
        # 添加一个明确的NODE_PATH环境变量指向node.exe
        env['NODE_PATH'] = nodejs_dir
    else:
        # 非Windows系统使用node执行npm
        command = [node_exe, npm_exe] + list(args)
        shell_setting = False
        
    return {
        "command": command, 
        "shell": shell_setting,
        "env": env
    }

def download_nodejs():
    """
    下载Node.js并解压到项目根目录的nodejs文件夹
    
    返回:
        bool: 下载并设置成功返回True，否则返回False
    """
    try:
        print(f"{Colors.BLUE}正在准备下载Node.js...{Colors.ENDC}")
        logger.info("准备下载Node.js")
        
        # 检测系统架构
        is_64bits = sys.maxsize > 2**32
        arch = 'x64' if is_64bits else 'x86'
        
        # Windows平台下载
        if IS_WINDOWS:
            # Node.js LTS (v18.17.1) 下载链接
            node_version = "18.17.1"
            download_url = f"https://nodejs.org/dist/v{node_version}/node-v{node_version}-win-{arch}.zip"
            
            print(f"{Colors.BLUE}开始下载Node.js v{node_version} ({arch})...{Colors.ENDC}")
            logger.info(f"开始下载Node.js v{node_version} ({arch})")
            
            # 创建临时目录用于下载
            with tempfile.TemporaryDirectory() as temp_dir:
                zip_path = os.path.join(temp_dir, "node.zip")
                
                # 使用requests进行流式下载，添加进度条
                try:
                    print(f"{Colors.BLUE}正在下载，请稍候...{Colors.ENDC}")
                    response = requests.get(download_url, stream=True)
                    total_size = int(response.headers.get('content-length', 0))
                    downloaded_size = 0
                    
                    # 转换为MB显示
                    total_size_mb = total_size / (1024 * 1024)
                    
                    with open(zip_path, 'wb') as f:
                        # 定义进度条宽度和字符
                        progress_width = 50
                        progress_char = "█"
                        
                        for chunk in response.iter_content(chunk_size=1024*1024):  # 1MB的块
                            if chunk:
                                f.write(chunk)
                                downloaded_size += len(chunk)
                                
                                # 计算下载百分比
                                percent = (downloaded_size / total_size) * 100
                                downloaded_mb = downloaded_size / (1024 * 1024)
                                
                                # 计算进度条显示
                                filled_width = int(progress_width * downloaded_size // total_size)
                                progress_bar = progress_char * filled_width + "-" * (progress_width - filled_width)
                                
                                # 清除当前行并显示进度
                                print(f"\r{Colors.BLUE}下载进度: [{progress_bar}] {percent:.1f}% ({downloaded_mb:.1f}MB/{total_size_mb:.1f}MB){Colors.ENDC}", end="")
                                
                    # 换行，确保后续输出正常
                    print()
                    print(f"{Colors.GREEN}下载完成{Colors.ENDC}")
                    logger.info("Node.js安装包下载完成")
                    
                except requests.exceptions.RequestException as e:
                    error_msg = f"下载Node.js时出错: {str(e)}"
                    logger.error(error_msg)
                    print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
                    return False
                
                # 解压Node.js到项目根目录的nodejs文件夹
                nodejs_dir = os.path.join(BASE_DIR, "nodejs")
                
                # 如果目录已存在，先删除
                if os.path.exists(nodejs_dir):
                    shutil.rmtree(nodejs_dir)
                
                os.makedirs(nodejs_dir)
                
                print(f"{Colors.BLUE}正在解压Node.js...{Colors.ENDC}")
                logger.info("正在解压Node.js")
                
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    # 解压缩文件列表
                    for file_info in zip_ref.infolist():
                        try:
                            # 从第一个目录级别开始提取，跳过根文件夹
                            parts = file_info.filename.split('/', 1)
                            if len(parts) > 1:
                                # 确保不会设置空文件名
                                new_filename = parts[1]
                                if new_filename:  # 检查不为空
                                    file_info.filename = new_filename
                                    zip_ref.extract(file_info, nodejs_dir)
                                else:
                                    # 跳过空文件名的条目，记录日志
                                    logger.debug(f"跳过空文件名条目: {file_info.filename}")
                            # 对于Windows风格的路径也做同样处理
                            elif '\\' in file_info.filename:
                                parts = file_info.filename.split('\\', 1)
                                if len(parts) > 1:
                                    new_filename = parts[1]
                                    if new_filename:  # 检查不为空
                                        file_info.filename = new_filename
                                        zip_ref.extract(file_info, nodejs_dir)
                                    else:
                                        # 跳过空文件名的条目，记录日志
                                        logger.debug(f"跳过空文件名条目: {file_info.filename}")
                        except IndexError as ie:
                            # 捕获并记录索引错误，但继续处理其他文件
                            logger.warning(f"处理文件 {file_info.filename} 时出现索引错误: {str(ie)}")
                            continue
                        except Exception as e:
                            # 捕获其他可能的错误
                            logger.warning(f"解压文件 {file_info.filename} 时出现错误: {str(e)}")
                            continue
                
                print(f"{Colors.GREEN}Node.js解压完成{Colors.ENDC}")
                logger.info("Node.js解压完成")
                
                # 更新Node.js和npm路径
                global NODE_EXE, NPM_EXE
                NODE_EXE = os.path.join(nodejs_dir, "node.exe")
                NPM_EXE = os.path.join(nodejs_dir, "npm.cmd")
                
                # 检查解压后的可执行文件是否存在
                if os.path.exists(NODE_EXE) and os.path.exists(NPM_EXE):
                    print(f"{Colors.GREEN}Node.js设置成功{Colors.ENDC}")
                    logger.info(f"Node.js设置成功，node路径: {NODE_EXE}, npm路径: {NPM_EXE}")
                    return True
                else:
                    logger.error(f"Node.js解压后未找到可执行文件，node路径: {NODE_EXE}, npm路径: {NPM_EXE}")
                    return False
        else:
            # 非Windows平台暂不支持自动下载
            print(f"{Colors.WARNING}非Windows平台暂不支持自动下载Node.js{Colors.ENDC}")
            logger.warning("非Windows平台暂不支持自动下载Node.js")
            return False
    
    except Exception as e:
        logger.error(f"下载或设置Node.js时出错: {str(e)}", exc_info=True)
        print(f"{Colors.FAIL}下载或设置Node.js时出错: {str(e)}{Colors.ENDC}")
        return False

def parse_arguments():
    """
    解析命令行参数
    """
    parser = argparse.ArgumentParser(description="项目服务统一启动器")
    parser.add_argument("--no-check", action="store_true", help="跳过环境检查直接启动")
    parser.add_argument("--frontend-only", action="store_true", help="仅启动前端服务")
    parser.add_argument("--backend-only", action="store_true", help="仅启动后端服务")
    return parser.parse_args()

def print_banner():
    """
    显示YSKZ字符图
    """
    banner = f"""
{Colors.BLUE}{Colors.BOLD}
██╗   ██╗███████╗██╗  ██╗███████╗
╚██╗ ██╔╝██╔════╝██║ ██╔╝╚══███╔╝
 ╚████╔╝ ███████╗█████╔╝   ███╔╝ 
  ╚██╔╝  ╚════██║██╔═██╗  ███╔╝  
   ██║   ███████║██║  ██╗███████╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝   Server
{Colors.ENDC}
{Colors.GREEN}==== 欢迎使用项目服务统一启动器 ===={Colors.ENDC}
{Colors.WARNING}按Ctrl+C终止所有服务{Colors.ENDC}
"""
    print(banner)
    logger.info("启动器已启动")

def run_command(command, cwd=None, check=True, shell=IS_WINDOWS, env=None):
    """
    执行命令并返回结果

    参数:
        command: 要执行的命令
        cwd: 执行命令的工作目录
        check: 是否检查命令执行结果
        shell: 是否使用shell执行命令
        env: 环境变量字典，如果为None则使用当前环境

    返回:
        subprocess.CompletedProcess: 命令执行结果
    """
    try:
        logger.debug(f"执行命令: {command} 在目录: {cwd or '当前目录'}")
        result = subprocess.run(
            command,
            cwd=cwd,
            check=check,
            shell=shell,
            text=True,
            capture_output=True,
            env=env
        )
        return result
    except subprocess.CalledProcessError as e:
        if check:
            error_msg = f"执行命令失败: {' '.join(command) if isinstance(command, list) else command}"
            logger.error(error_msg)
            logger.error(f"错误信息: {e.stderr}")
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            print(f"{Colors.FAIL}错误信息: {e.stderr}{Colors.ENDC}")
        return e
    except Exception as e:
        error_msg = f"执行命令时发生未知错误: {str(e)}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        raise

def print_separator():
    """
    打印分隔线，用于分隔不同的输出块
    """
    separator = "-" * 50
    print(f"\n{Colors.BLUE}{separator}{Colors.ENDC}\n")
    logger.debug("输出分隔线")

def check_nodejs():
    """
    检查根目录下的Node.js是否存在并且版本是否满足要求

    返回:
        bool: 检查是否通过
    """
    logger.info("检查根目录下的Node.js环境")
    print(f"{Colors.BLUE}检查根目录下的Node.js环境...{Colors.ENDC}")
    
    # 定义根目录下Node.js和npm的路径
    nodejs_dir = os.path.join(BASE_DIR, "nodejs")
    node_exe = os.path.join(nodejs_dir, "node.exe" if IS_WINDOWS else "bin/node")
    npm_exe = os.path.join(nodejs_dir, "npm.cmd" if IS_WINDOWS else "bin/npm")
    
    # 检查Node.js可执行文件是否存在
    if not os.path.exists(node_exe):
        print(f"{Colors.WARNING}未检测到根目录下的Node.js{Colors.ENDC}")
        
        # 询问是否要自动下载
        choice = input(f"{Colors.WARNING}是否自动下载并安装Node.js? (y/n): {Colors.ENDC}")
        if choice.lower() == 'y':
            if download_nodejs():
                # 重新定义路径（因为下载可能创建了不同的目录结构）
                nodejs_dir = os.path.join(BASE_DIR, "nodejs")
                node_exe = os.path.join(nodejs_dir, "node.exe" if IS_WINDOWS else "bin/node")
                npm_exe = os.path.join(nodejs_dir, "npm.cmd" if IS_WINDOWS else "bin/npm")
                
                # 再次检查文件是否存在
                if not os.path.exists(node_exe):
                    error_msg = "下载完成但未找到Node.js可执行文件，路径结构可能不一致"
                    logger.error(error_msg)
                    print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
                    print(f"{Colors.WARNING}请手动从Node.js官网下载后解压到项目根目录下的nodejs文件夹{Colors.ENDC}")
                    print(f"{Colors.WARNING}下载地址: https://nodejs.org/en/download/{Colors.ENDC}")
                    return False
            else:
                error_msg = "自动下载Node.js失败"
                logger.error(error_msg)
                print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
                print(f"{Colors.WARNING}请手动从Node.js官网下载后解压到项目根目录下的nodejs文件夹{Colors.ENDC}")
                print(f"{Colors.WARNING}下载地址: https://nodejs.org/en/download/{Colors.ENDC}")
                return False
        else:
            error_msg = "用户选择不自动下载Node.js"
            logger.warning(error_msg)
            print(f"{Colors.WARNING}请手动从Node.js官网下载后解压到项目根目录下的nodejs文件夹{Colors.ENDC}")
            print(f"{Colors.WARNING}下载地址: https://nodejs.org/en/download/{Colors.ENDC}")
            return False
    
    # 检查npm可执行文件是否存在
    if not os.path.exists(npm_exe):
        error_msg = "未检测到根目录下的npm，Node.js安装可能不完整"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return False
    
    # 获取Node.js版本
    node_command = [node_exe, "--version"]
    
    # 创建环境变量，确保将node.exe所在目录添加到PATH
    env = os.environ.copy()
    nodejs_dir_path = os.path.dirname(node_exe)
    if nodejs_dir_path not in env.get('PATH', ''):
        env['PATH'] = nodejs_dir_path + os.pathsep + env.get('PATH', '')
    env['NODE_PATH'] = nodejs_dir_path
    env['PYTHONIOENCODING'] = 'utf-8'  # 确保正确处理UTF-8输出
    
    try:
        result = subprocess.run(
            node_command,
            check=False,
            shell=False,
            text=True,
            encoding='utf-8',  # 指定UTF-8编码
            capture_output=True,
            env=env
        )
        
        if result.returncode != 0:
            error_msg = "根目录Node.js版本检测失败"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return False
        
        node_version = result.stdout.strip()
        logger.info(f"检测到根目录Node.js版本: {node_version}")
        print(f"{Colors.GREEN}检测到根目录Node.js版本: {node_version}{Colors.ENDC}")
    except Exception as e:
        error_msg = f"检测Node.js版本时发生错误: {str(e)}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return False
    
    # 获取npm版本
    # 修复在Windows下执行npm命令的问题：
    # 在Windows系统中，npm.cmd是批处理文件，不能通过node.exe直接执行
    # 需要直接执行npm.cmd，而不是通过node.exe执行它
    npm_cmd = create_npm_command(npm_exe, node_exe, "--version")
    
    try:
        # 使用直接Popen方式，避免编码问题
        process = subprocess.Popen(
            npm_cmd["command"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=npm_cmd["shell"],  # 根据操作系统设置shell参数
            env=npm_cmd["env"]  # 使用create_npm_command返回的环境变量
        )
        
        # 读取输出并进行错误处理
        try:
            stdout, stderr = process.communicate(timeout=10)
            
            # 使用errors='replace'处理无法解码的字符
            npm_version = stdout.decode('utf-8', errors='replace').strip()
            
            if process.returncode != 0 or not npm_version:
                error_msg = "根目录npm版本检测失败"
                logger.error(error_msg)
                if stderr:
                    logger.error(f"错误信息: {stderr.decode('utf-8', errors='replace')}")
                print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
                return False
            
            logger.info(f"检测到根目录npm版本: {npm_version}")
            print(f"{Colors.GREEN}检测到根目录npm版本: {npm_version}{Colors.ENDC}")
            
        except subprocess.TimeoutExpired:
            process.kill()
            error_msg = "获取npm版本超时"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return False
            
    except Exception as e:
        error_msg = f"检测npm版本时发生错误: {str(e)}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return False
    
    # 设置全局变量以便其他函数使用
    global NODE_EXE, NPM_EXE
    NODE_EXE = node_exe
    NPM_EXE = npm_exe
    
    return True

def check_and_install_dependencies(project_dir, project_name):
    """
    检查并安装项目依赖

    参数:
        project_dir: 项目目录路径
        project_name: 项目名称

    返回:
        bool: 安装是否成功
    """
    logger.info(f"检查{project_name}依赖")
    print(f"{Colors.BLUE}检查{project_name}依赖...{Colors.ENDC}")
    
    # 检查node_modules目录是否存在
    node_modules_path = os.path.join(project_dir, "node_modules")
    
    if not os.path.exists(node_modules_path) or not os.listdir(node_modules_path):
        logger.warning(f"{project_name}依赖未安装，正在安装依赖")
        print(f"{Colors.WARNING}{project_name}依赖未安装，正在安装依赖...{Colors.ENDC}")
        
        # 使用根目录下的npm安装依赖
        npm_cmd = create_npm_command(NPM_EXE, NODE_EXE, "install")
        command_str = " ".join(npm_cmd["command"])
        print(f"{Colors.BLUE}执行: {command_str} 在 {project_dir}{Colors.ENDC}")
        
        try:
            result = subprocess.run(
                npm_cmd["command"],
                cwd=project_dir,
                check=False,
                shell=npm_cmd["shell"],
                text=True,
                capture_output=True,
                env=npm_cmd["env"]  # 传递环境变量
            )
            
            if result.returncode != 0:
                error_msg = f"{project_name}依赖安装失败"
                logger.error(error_msg)
                logger.error(f"错误信息: {result.stderr}")
                print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
                print(f"{Colors.FAIL}错误信息: {result.stderr}{Colors.ENDC}")
                return False
            
            logger.info(f"{project_name}依赖安装成功")
            print(f"{Colors.GREEN}{project_name}依赖安装成功{Colors.ENDC}")
        except Exception as e:
            error_msg = f"安装{project_name}依赖时发生错误: {str(e)}"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return False
    else:
        logger.info(f"{project_name}依赖已安装")
        print(f"{Colors.GREEN}{project_name}依赖已安装{Colors.ENDC}")
    
    return True

def setup_environment():
    """
    检查并设置环境

    返回:
        bool: 环境设置是否成功
    """
    logger.info("开始环境检查")
    print(f"{Colors.BLUE}开始环境检查...{Colors.ENDC}")
    
    # 检查Node.js
    if not check_nodejs():
        return False
    
    # 检查后端依赖
    if not check_and_install_dependencies(BACKEND_DIR, "后端"):
        return False
    
    # 检查前端依赖
    if not check_and_install_dependencies(FRONTEND_DIR, "前端"):
        return False
    
    # 检查根目录依赖
    if os.path.exists(os.path.join(BASE_DIR, "package.json")):
        if not check_and_install_dependencies(BASE_DIR, "根目录"):
            return False
    
    logger.info("环境检查完成，所有依赖已安装")
    print(f"{Colors.GREEN}环境检查完成，所有依赖已安装{Colors.ENDC}")
    return True

def start_backend():
    """
    启动后端服务

    返回:
        subprocess.Popen或None: 后端服务进程，如果启动失败则返回None
    """
    logger.info("启动后端服务")
    print(f"{Colors.BLUE}启动后端服务...{Colors.ENDC}")
    
    # 首先检查是否需要编译
    dist_path = os.path.join(BACKEND_DIR, "dist")
    if not os.path.exists(dist_path) or not os.listdir(dist_path):
        logger.warning("后端编译文件不存在，正在编译")
        print(f"{Colors.WARNING}后端编译文件不存在，正在编译...{Colors.ENDC}")
        
        # 使用根目录的Node.js构建后端
        npm_cmd = create_npm_command(NPM_EXE, NODE_EXE, "run", "build")
        try:
            result = subprocess.run(
                npm_cmd["command"],
                cwd=BACKEND_DIR,
                check=False,
                shell=npm_cmd["shell"],
                text=True,
                capture_output=True,
                env=npm_cmd["env"]  # 传递环境变量
            )
            
            if result.returncode != 0:
                error_msg = "后端编译失败"
                logger.error(error_msg)
                logger.error(f"错误信息: {result.stderr}")
                print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
                print(f"{Colors.FAIL}错误信息: {result.stderr}{Colors.ENDC}")
                return None
                
            logger.info("后端编译成功")
            print(f"{Colors.GREEN}后端编译成功{Colors.ENDC}")
        except Exception as e:
            error_msg = f"编译后端时发生错误: {str(e)}"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return None
    
    # 启动后端服务
    logger.info("启动后端服务进程")
    print(f"{Colors.BLUE}启动后端服务...{Colors.ENDC}")
    
    # 使用根目录的Node.js启动后端
    npm_cmd = create_npm_command(NPM_EXE, NODE_EXE, "start")
    
    try:
        if IS_WINDOWS:
            # Windows下启动
            process = subprocess.Popen(
                npm_cmd["command"],
                cwd=BACKEND_DIR,
                shell=npm_cmd["shell"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                env=npm_cmd["env"]  # 传递环境变量
            )
        else:
            # Linux/Mac下启动
            process = subprocess.Popen(
                npm_cmd["command"],
                cwd=BACKEND_DIR,
                shell=npm_cmd["shell"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid,
                env=npm_cmd["env"]  # 传递环境变量
            )
        
        # 等待服务启动
        time.sleep(2)
        
        # 检查进程是否成功启动
        if process.poll() is not None:
            error_msg = "后端服务启动失败"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return None
        
        logger.info(f"后端服务启动成功，PID: {process.pid}")
        print(f"{Colors.GREEN}后端服务启动成功，PID: {process.pid}{Colors.ENDC}")
        return process
    except Exception as e:
        error_msg = f"启动后端服务时发生错误: {str(e)}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return None

def start_frontend():
    """
    启动前端服务

    返回:
        subprocess.Popen或None: 前端服务进程，如果启动失败则返回None
    """
    logger.info("启动前端服务")
    print(f"{Colors.BLUE}启动前端服务...{Colors.ENDC}")
    
    # 使用根目录的Node.js启动前端，并添加--host 0.0.0.0参数支持任意IP访问
    npm_cmd = create_npm_command(NPM_EXE, NODE_EXE, "run", "dev", "--", "--host", "0.0.0.0")
    
    try:
        if IS_WINDOWS:
            # Windows下启动
            process = subprocess.Popen(
                npm_cmd["command"],
                cwd=FRONTEND_DIR,
                shell=npm_cmd["shell"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                env=npm_cmd["env"]  # 传递环境变量
            )
        else:
            # Linux/Mac下启动
            process = subprocess.Popen(
                npm_cmd["command"],
                cwd=FRONTEND_DIR,
                shell=npm_cmd["shell"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid,
                env=npm_cmd["env"]  # 传递环境变量
            )
        
        # 等待服务启动
        time.sleep(2)
        
        # 检查进程是否成功启动
        if process.poll() is not None:
            error_msg = "前端服务启动失败"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return None
        
        logger.info(f"前端服务启动成功，PID: {process.pid}")
        print(f"{Colors.GREEN}前端服务启动成功，PID: {process.pid}{Colors.ENDC}")
        return process
    except Exception as e:
        error_msg = f"启动前端服务时发生错误: {str(e)}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return None

def cleanup_processes():
    """
    清理所有子进程，确保在脚本退出时关闭所有服务
    """
    if not processes:  # 如果没有进程需要清理，直接返回
        return
    
    logger.info("正在关闭所有服务")
    print(f"\n{Colors.WARNING}正在关闭所有服务...{Colors.ENDC}")
    
    for process in processes:
        if process.poll() is None:  # 进程仍在运行
            try:
                process_id = process.pid
                logger.info(f"正在终止进程: {process_id}")
                
                if IS_WINDOWS:
                    # Windows下强制终止进程树
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(process_id)])
                else:
                    # Unix下终止进程组
                    os.killpg(os.getpgid(process_id), signal.SIGTERM)
                    
                # 给进程一些时间来优雅地关闭
                time.sleep(1)
                
                # 如果进程仍在运行，强制终止
                if process.poll() is None:
                    logger.warning(f"进程 {process_id} 未正常终止，强制关闭")
                    if IS_WINDOWS:
                        subprocess.call(['taskkill', '/F', '/PID', str(process_id)])
                    else:
                        os.killpg(os.getpgid(process_id), signal.SIGKILL)
                
                logger.info(f"进程 {process_id} 已终止")
            except Exception as e:
                error_msg = f"终止进程 {process.pid} 时出错: {str(e)}"
                logger.error(error_msg)
                print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
    
    # 清空进程列表
    processes.clear()
    logger.info("所有服务已关闭")
    print(f"{Colors.GREEN}所有服务已关闭{Colors.ENDC}")

def signal_handler(sig, frame):
    """
    信号处理函数，处理Ctrl+C等终止信号

    参数:
        sig: 信号编号
        frame: 当前帧
    """
    signal_name = "SIGINT" if sig == signal.SIGINT else "SIGTERM"
    logger.info(f"接收到{signal_name}信号，正在关闭服务")
    print(f"\n{Colors.WARNING}接收到终止信号，正在关闭服务...{Colors.ENDC}")
    cleanup_processes()
    sys.exit(0)

def monitor_processes():
    """
    监控进程状态并处理输出
    """
    logger.info("开始监控进程状态")
    
    try:
        while processes:
            for i, process in enumerate(processes[:]):
                # 检查进程是否仍在运行
                if process.poll() is not None:
                    logger.warning(f"进程 {process.pid} 已终止，退出代码: {process.returncode}")
                    print(f"{Colors.WARNING}进程 {process.pid} 已终止，退出代码: {process.returncode}{Colors.ENDC}")
                    processes.remove(process)
                    continue
                
                # 处理标准输出 - 修改为安全解码
                while True:
                    line = process.stdout.readline()
                    if not line:
                        break
                    try:
                        # 使用UTF-8解码，errors='replace'参数会用替换无法解码的字符
                        decoded_line = line.decode('utf-8', errors='replace').strip()
                        print(decoded_line)
                    except Exception as e:
                        logger.error(f"解码进程输出时发生错误: {str(e)}")
                        continue
                
                # 处理标准错误 - 修改为安全解码
                while True:
                    line = process.stderr.readline()
                    if not line:
                        break
                    try:
                        # 使用UTF-8解码，errors='replace'参数会用替换无法解码的字符
                        decoded_line = line.decode('utf-8', errors='replace').strip()
                        print(f"{Colors.WARNING}{decoded_line}{Colors.ENDC}")
                    except Exception as e:
                        logger.error(f"解码进程错误输出时发生错误: {str(e)}")
                        continue
            
            # 如果所有进程都已退出，则退出循环
            if not processes:
                logger.warning("所有服务已停止，启动器退出")
                print(f"{Colors.FAIL}所有服务已停止，启动器退出{Colors.ENDC}")
                break
            
            # 休眠一段时间再检查
            time.sleep(0.1)
    except KeyboardInterrupt:
        # 捕获键盘中断(Ctrl+C)
        logger.info("接收到键盘中断，正在关闭服务")
        print(f"\n{Colors.WARNING}接收到键盘中断，正在关闭服务...{Colors.ENDC}")
        cleanup_processes()
    except Exception as e:
        error_msg = f"监控进程时发生错误: {str(e)}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        cleanup_processes()

def welcome():
    """
    显示欢迎信息并解析命令行参数
    """
    # 显示欢迎横幅
    print_banner()
    
    # 解析命令行参数
    args = parse_arguments()
    
    # 注册信号处理函数，确保能够正确处理Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # 如果有帮助参数，显示帮助信息并退出
    if '--help' in sys.argv or '-h' in sys.argv:
        print_help()
        sys.exit(0)
    
    logger.info("项目服务统一启动器初始化完成")
    return args

def check_python():
    """
    检查Python版本是否满足要求
    
    返回:
        bool: 检查是否通过
    """
    logger.info("检查Python环境")
    print(f"{Colors.BLUE}检查Python环境...{Colors.ENDC}")
    
    # 获取当前Python版本
    python_version = sys.version.split(' ')[0]
    logger.info(f"检测到Python版本: {python_version}")
    print(f"{Colors.GREEN}检测到Python版本: {python_version}{Colors.ENDC}")
    
    # 解析版本号
    try:
        major, minor, *_ = map(int, python_version.split('.'))
        
        # 检查Python版本是否满足要求（要求Python 3.6+）
        if major < 3 or (major == 3 and minor < 6):
            error_msg = f"当前Python版本 {python_version} 过低，要求Python 3.6+"
            logger.error(error_msg)
            print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
            return False
            
        logger.info("Python版本检查通过")
        print(f"{Colors.GREEN}Python版本检查通过{Colors.ENDC}")
        return True
    except (ValueError, IndexError):
        error_msg = f"无法解析Python版本 {python_version}"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return False

def install_dependencies():
    """
    安装项目依赖
    
    返回:
        bool: 安装是否成功
    """
    logger.info("开始安装项目依赖")
    print(f"{Colors.BLUE}开始安装项目依赖...{Colors.ENDC}")
    
    # 调用环境设置函数
    if not setup_environment():
        error_msg = "环境设置失败，无法安装依赖"
        logger.error(error_msg)
        print(f"{Colors.FAIL}{error_msg}{Colors.ENDC}")
        return False
    
    logger.info("项目依赖安装完成")
    print(f"{Colors.GREEN}项目依赖安装完成{Colors.ENDC}")
    return True

def start_app():
    """
    启动应用程序
    
    返回:
        bool: 启动是否成功
    """
    logger.info("开始启动应用")
    print(f"{Colors.BLUE}开始启动应用...{Colors.ENDC}")
    
    # 解析命令行参数
    args = parse_arguments()
    
    # 确定启动哪些服务
    start_backend_service = not args.frontend_only
    start_frontend_service = not args.backend_only
    
    success = True
    
    # 启动后端服务
    if start_backend_service:
        backend_process = start_backend()
        if backend_process:
            processes.append(backend_process)
            logger.info("后端服务已添加到进程监控列表")
        else:
            logger.error("后端服务启动失败")
            success = False
    
    # 启动前端服务
    if start_frontend_service:
        frontend_process = start_frontend()
        if frontend_process:
            processes.append(frontend_process)
            logger.info("前端服务已添加到进程监控列表")
        else:
            logger.error("前端服务启动失败")
            success = False
    
    # 如果有进程成功启动，则开始监控
    if processes:
        print(f"{Colors.GREEN}服务启动成功，正在监控服务状态...{Colors.ENDC}")
        # 在主线程中监控进程
        monitor_processes()
    
    return success

def print_help():
    """
    打印帮助信息
    """
    help_text = f"""
{Colors.GREEN}项目服务统一启动器使用说明{Colors.ENDC}

{Colors.BLUE}功能:{Colors.ENDC}
1. 显示YSKZ字符图
2. 检测并安装必要环境
3. 统一启动前后端服务
4. 管理服务生命周期，确保关闭启动器时所有服务一起关闭

{Colors.BLUE}环境要求:{Colors.ENDC}
- 需在根目录下的nodejs文件夹中放置Node.js环境（从官网下载解压即可）
- 启动器将使用根目录的Node.js，不依赖系统安装的Node.js

{Colors.BLUE}命令行参数:{Colors.ENDC}
python start.py            # 正常启动
python start.py --help     # 显示此帮助信息
python start.py --no-check # 跳过环境检查直接启动
python start.py --frontend-only # 仅启动前端服务
python start.py --backend-only  # 仅启动后端服务

{Colors.BLUE}操作说明:{Colors.ENDC}
- 按 Ctrl+C 终止所有服务并退出启动器

{Colors.BLUE}日志位置:{Colors.ENDC}
- 日志文件保存在 logs/ 目录下
"""
    print(help_text)

def main():
    """
    主函数
    """
    welcome()
    
    # 创建日志目录
    os.makedirs(os.path.join(BASE_DIR, "log"), exist_ok=True)
    
    # 检查环境
    environment_check_failed = False
    
    if not check_python():
        print_separator()
        print(f"{Colors.WARNING}Python环境检查未通过，程序可能无法正常运行{Colors.ENDC}")
        environment_check_failed = True
    
    if not check_nodejs():
        print_separator()
        print(f"{Colors.WARNING}Node.js环境检查未通过，程序可能无法正常运行{Colors.ENDC}")
        environment_check_failed = True
    
    if environment_check_failed:
        print_separator()
        print(f"{Colors.WARNING}环境检查未通过，请先解决上述问题再继续{Colors.ENDC}")
        # 等待用户按键，而不是自动退出
        input(f"{Colors.BLUE}按任意键继续...{Colors.ENDC}")
        return 1
    
    # 环境检查通过，继续运行
    print_separator()
    print(f"{Colors.GREEN}环境检查通过，准备启动程序{Colors.ENDC}")
    
    # 在这里调用其他函数，如安装依赖、启动应用等
    if not install_dependencies():
        print_separator()
        print(f"{Colors.FAIL}依赖安装失败，程序可能无法正常运行{Colors.ENDC}")
        input(f"{Colors.BLUE}按任意键继续...{Colors.ENDC}")
        return 1
    
    if not start_app():
        print_separator()
        print(f"{Colors.FAIL}应用启动失败{Colors.ENDC}")
        input(f"{Colors.BLUE}按任意键继续...{Colors.ENDC}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())