/*!
 * @author dawangraoming
 * @date 2018/06/25
 */
///<reference path="../iconfont-helper.d.ts"/>

import './style.scss';
//
// const $ = document.querySelector.bind(document);
// const $$ = document.querySelectorAll.bind(document);

import * as JSZip from 'jszip';
import * as $ from 'jquery';
import {kebabCase} from 'lodash'

let timeHandler: number;

// 添加遮罩层，防止认为页面卡死
$('body').append(`
<div style="display: none;" class="_dawangraoming_popup-mask" id="__dawangraoming_mask__">操作中，请稍后。。。</div>
`);
const mask = $('#__dawangraoming_mask__');

/**
 * 生成下载文件名
 * @return {string}
 */
function genFileName() {
    const now = new Date()
    return `icons-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.zip`
}

/**
 * 是否为native类型
 * @param svg 名称
 * @return {boolean}
 */
function getNameInfo(name: string) {
    const prefixList = ['shuangse', 'duose']
    for (let i = 0; i < prefixList.length; i++) {
        if(name.startsWith(prefixList[i])) {
            return {native: true, name: name.slice(prefixList[i].length)}
        }
    }
    return {native: false, name}
}

/**
 * 将SVG转PNG数据
 * @param svg {string} svg 字符串
 * @param [size] {number} 图像尺寸、
 * @param [type] {string} 下载类型，支持png、GIF、
 * @return {Promise<string>} 返回一个Promise
 */
function createPNG(svg: string, size = 200, type?: string): Promise<string> {
    return new Promise(resolve => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;left:0;top:0;display:block;';
        document.body.appendChild(img);
        document.body.appendChild(canvas);
        // size = size ? size : 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // 设置高质量，防止缩放时导致不清晰
        ctx.imageSmoothingQuality = 'high';
        // 设置输出类型
        let compileType: string;
        switch (type) {
            case 'webp':
                compileType = 'webp';
                break;

            case 'jpg':
            case 'jpeg':
                compileType = 'jpep';
                break;

            case 'png':
            default:
                compileType = 'png'
        }
        compileType = 'image/' + compileType;
        // 图片加载完毕后
        img.onload = function () {
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL(compileType));
            $(canvas).remove();
            $(img).remove();
        };
        img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    });
}

/**
 * 通过DOM节点获取svg xml
 * @param element {Element | JQuery}
 * @param [index] {number}
 */
function getSVGFromNode(element: Element | JQuery, index = 0): { data: string, name: string } {
    const dom = $(element);
    const name = dom.find('span.icon-code.icon-code-show').attr('title');
    // 获取SVG节点
    const svg = dom.find('svg.icon');
    // 获取SVG路径，去除掉无用的信息
    const data = `<svg xmlns="${svg.attr('xmlns')}" viewBox="${svg.attr('viewBox')}" version="${svg.attr('version')}">${svg.html()}</svg>`
    return {
        data,
        name
    };
}

/**
 * 下载模块
 * @param [type] {string} 可选，下载类型，支持png、svg，默认svg
 * @param [size] {number} 图像尺寸
 * @return {Promise<void>}
 */
async function download(type?: IconFontHelper.imgType, size?: number): Promise<void> {
    if(localStorage.getItem('_iconfont_view_type_') === 'unicode') {
        alert('请切换到Font class或Symbo标签下')
        return;
    }
    // 获取所有购物车内的元素
    const iconList = document.querySelectorAll(".page-manage-container .block-icon-list>li");
    if (!iconList || iconList.length < 1) return;
    // 创建zip数据
    let zipFile = new JSZip();
    let outlineFolder = zipFile.folder('outline');
    let nativeFolder = zipFile.folder('native');
    let nameArray: {outline: string[], native: string[]} = {
        outline: [],
        native: [],
    };

    for (let index = 0; index < iconList.length; index++) {
        // 获取SVG的信息与名称
        // 获取SVG路径，去除掉无用的信息
        let {data, name: oldName} = getSVGFromNode(iconList[index]);
        oldName = kebabCase(oldName)
        let {native, name} = getNameInfo(oldName)
        native ? nameArray.native.push(name) : nameArray.outline.push(name)
        if (type === 'svg' || !type) {
            name += '.svg';
            native ? nativeFolder.file(name, data) : outlineFolder.file(name, data);
        } else {
            name += '.' + type;
            let pngFile = await createPNG(data, size, type);
            pngFile = pngFile.replace(/^data:image\/\w+;base64,/, '');
            native ? nativeFolder.file(name, pngFile, {base64: true}) : outlineFolder.file(name, pngFile, {base64: true});
        }
    }

    zipFile.file('downloaded-icons.txt', JSON.stringify(nameArray));
    zipFile.generateAsync({type: "blob"}).then(function (content: BlobPart) {
        const url = window.URL.createObjectURL(new Blob([content], {"type": "application\/zip"}));
        // 创建一个下载标签
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("class", "svg-crowbar");
        a.setAttribute("download", genFileName());
        a.setAttribute("href", url);
        a.style["display"] = "none";
        a.click();

        setTimeout(function () {
            window.URL.revokeObjectURL(url);
        }, 10);
    });
}


/**
 * 选取图标进购物车
 * @param type
 */
function select(type: string) {
    mask.show();
    clearTimeout(timeHandler);
    // 高频操作前做一个延迟，防止遮罩层未渲染
    timeHandler = window.setTimeout(function () {
        const iconList = document.querySelectorAll("#magix_vf_main .block-icon-list > li");
        Array.from(iconList).forEach(ele => {
            // 如果是全选，则排除掉已经选中的元素
            if (type === 'all') {
                if (/selected/.test(ele.className)) return;
            }
            (ele.querySelector('.icon-gouwuche1') as HTMLSpanElement).click();
        });
        mask.hide();
    }, 300);
}

/**
 * 设置图标色
 * @param [color] {string}
 */
function setIconColor(color: string = '') {
    $('#magix_vf_main .block-icon-list > li svg path').css('fill', color);
}

// 注册监听事件
chrome.runtime.onMessage.addListener(function (request: IconFontHelper.MessageType, sender, sendResponse) {
    switch (request.type) {
        case 'select-all':
            select('all');
            break;

        case 'select-invert':
            select('invert');
            break;

        case 'download-svg':
            download('svg', request.size);
            break;

        case 'download-png':
            download('png', request.size);
            break;

        case 'download-jpg':
            download('jpg', request.size);
            break;

        case 'download-webp':
            download('webp', request.size);
            break;

        case 'set-icon-color':
            setIconColor(request.color);
            break;
    }
    sendResponse('over');
});

/**
 * 弹窗消息
 * @param str
 * @return {Promise<void>}
 */
function alertMessage(str: string): Promise<void> {
    const dom = $(`<p class="_dawangraoming_alert-message">${str}</p>`);
    $('body').append(dom);
    return new Promise(resolve => {
        dom.delay(800).fadeOut(300, function () {
            dom.remove();
            resolve();
        });
    })
}


const observer = new MutationObserver(function () {
    // 判断图标列表是否渲染
    const domList = $('#magix_vf_main .block-icon-list > li .icon-cover');
    if (domList.length > 0) {
        // 注销监听
        observer.disconnect();
        // 对每个图标都插入一个复制按钮
        domList.each(function () {
            $(this).append(`
            <span title="复制图标(SVG)" class="cover-item iconfont cover-item-line _dawangraoming_copy-button">复制</span>
            `);
        });
        // 注册事件监听
        $("#magix_vf_main .block-icon-list").on('click', '._dawangraoming_copy-button', function () {
            // 获取SVG XML
            const {data, name} = getSVGFromNode($(this).closest('li[p-id]'));
            const id = '_dawangraoming_copy';
            // 插入一个输入框，用于复制功能
            $('body').append(`<input readonly="readonly" id="${id}" />`);
            const $input = $(`#${id}`);
            $input.val(data);
            $input.select();
            // 执行复制
            document.execCommand('copy');
            // 用完就删，做个渣男
            $input.remove();
            // 弹出信息通知
            alertMessage(`${name}, 复制成功`);
        });
    }
});

// 对root节点以及子节点变更进行监听
observer.observe(document.querySelector('#root'), {
    subtree: true,
    childList: true,
    attributes: false,
    characterData: false,
});

