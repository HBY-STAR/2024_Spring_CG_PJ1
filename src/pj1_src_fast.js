// pj1源代码
// 2024 Spring HouBinyang

//设置顶点样式
let pointRadius = 10;
let pointColor = [255, 0, 0];
let pointEdgeColor = [0, 0, 0];

// 获取canvas及其上下文
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

/**
 * 主函数
 */
function main() {
    // 设置canvas大小
    canvas.width = canvasSize.maxX;
    canvas.height = canvasSize.maxY;

    //将canvas坐标整体偏移0.5，用于解决宽度为1个像素的线段的绘制问题，具体原理详见project文档
    ctx.translate(0.5, 0.5);

    //初始化事件处理函数
    initEventHandlers(canvas);

    //第一次绘制图形
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAll(ctx, vertex_pos, pointRadius, pointColor, pointEdgeColor);
}


/**
 * 绘制所有图形
 * @param {CanvasRenderingContext2D} ctx - 画布上下文对象
 * @param {Array} vertex_pos - 顶点位置数组
 * @param {number} pointRadius - 顶点半径
 * @param {Array} pointColor - 顶点颜色
 * @param {Array} pointEdgeColor - 顶点边缘颜色
 */
function drawAll(ctx, vertex_pos, pointRadius, pointColor, pointEdgeColor) {
    //填充多边形
    for (let i = 0; i < polygon.length; i++) {
        drawPolygon(ctx, vertex_pos, polygon[i], vertex_color[polygon[i][0]]);
    }
    //绘制顶点
    for (let i = 0; i < vertex_pos.length; i++) {
        drawVertex(ctx, vertex_pos[i][0], vertex_pos[i][1], pointRadius, pointColor, pointEdgeColor);
    }
}

/**
 * 重新绘制多边形，被拖动的顶点后绘制
 * @param ctx - 画布上下文对象
 * @param vertex_pos - 顶点位置数组
 * @param pointRadius - 顶点半径
 * @param pointColor - 顶点颜色
 * @param pointEdgeColor - 顶点边缘颜色
 * @param vertexIndex - 顶点索引
 */
function reDraw(ctx, vertex_pos, pointRadius, pointColor, pointEdgeColor, vertexIndex) {
    let reDrawPolygon = [];
    let beforePolygon = [];

    //根据顶点索引判断绘制顺序
    for (let i = 0; i < polygon.length; i++) {
        if (polygon[i].includes(vertexIndex)) {
            reDrawPolygon.push(polygon[i]);
        }else {
            beforePolygon.push(polygon[i]);
        }
    }

    //清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //绘制图形
    for(let i = 0; i < beforePolygon.length; i++) {
        drawPolygon(ctx, vertex_pos, beforePolygon[i], vertex_color[beforePolygon[i][0]]);
    }
    for (let i = 0; i < reDrawPolygon.length; i++) {
        drawPolygon(ctx, vertex_pos, reDrawPolygon[i], vertex_color[reDrawPolygon[i][0]]);
    }
    for (let i = 0; i < vertex_pos.length; i++) {
        drawVertex(ctx, vertex_pos[i][0], vertex_pos[i][1], pointRadius, pointColor, pointEdgeColor);
    }

}

/**
 * 绘制多边形
 * @param {CanvasRenderingContext2D} ctx - 画布上下文对象
 * @param {Array} vertex_pos - 顶点位置数组
 * @param {Array} polygon - 多边形顶点索引数组
 * @param {string} vertex_color - 顶点颜色
 */
function drawPolygon(ctx, vertex_pos, polygon, vertex_color) {
    // 计算多边形在垂直方向上的最小和最大Y坐标
    const minY = Math.min(...polygon.map((index) => vertex_pos[index][1]));
    const maxY = Math.max(...polygon.map((index) => vertex_pos[index][1]));

    // 遍历每一行扫描线
    for (let y = minY; y <= maxY; y++) {
        const intersections = [];

        // 遍历多边形的每一条边
        for (let i = 0; i < polygon.length; i++) {
            const j = (i + 1) % polygon.length;
            const vertex1 = vertex_pos[polygon[i]];
            const vertex2 = vertex_pos[polygon[j]];

            // 判断扫描线与边的交点
            if ((vertex1[1] <= y && vertex2[1] > y) || (vertex1[1] > y && vertex2[1] <= y)) {
                const x = (vertex1[0] * (vertex2[1] - y) + vertex2[0] * (y - vertex1[1])) / (vertex2[1] - vertex1[1]);
                intersections.push(x);
            }
        }

        // 对交点进行排序
        intersections.sort((a, b) => a - b);

        // 绘制扫描线
        for (let i = 0; i < intersections.length; i += 2) {
            const startX = Math.ceil(intersections[i]);
            const endX = Math.floor(intersections[i + 1]);
            drawScanline(ctx, startX, endX, y, vertex_color);
        }
    }
}


/**
 * 绘制扫描线
 * @param ctx - 画布上下文对象
 * @param startX - x开始位置
 * @param endX - x结束位置
 * @param y - y位置
 * @param vertex_color - 顶点颜色
 */
function drawScanline(ctx, startX, endX, y, vertex_color) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.strokeStyle = `rgb(${vertex_color[0]}, ${vertex_color[1]}, ${vertex_color[2]})`;
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * 绘制顶点
 * @param ctx - 画布上下文对象
 * @param x - x坐标
 * @param y - y坐标
 * @param pointRadius - 顶点半径
 * @param pointColor - 顶点颜色
 * @param pointEdgeColor - 顶点边缘颜色
 */
function drawVertex(ctx, x, y, pointRadius, pointColor, pointEdgeColor) {
    //遍历顶点附近的正方形区域
    for (let i = x - pointRadius; i < x + pointRadius; i++) {
        for (let j = y - pointRadius; j < y + pointRadius; j++) {
            if ((i - x) * (i - x) + (j - y) * (j - y) > pointRadius * pointRadius) {
                continue;
            } else if ((i - x) * (i - x) + (j - y) * (j - y) > (pointRadius - 1) * (pointRadius - 1)) {
                drawPoint(ctx, i, j, pointEdgeColor);
            } else {
                drawPoint(ctx, i, j, pointColor);
            }
        }
    }
}

/**
 * 绘制点
 * @param ctx - 画布上下文对象
 * @param x - x坐标
 * @param y - y坐标
 * @param color - 颜色
 */
function drawPoint(ctx, x, y, color) {
    //建立一条新的路径
    ctx.beginPath();
    //设置画笔的颜色
    ctx.strokeStyle = "rgb(" + color[0] + "," + +color[1] + "," + +color[2] + ")";
    ctx.lineWidth = 2;
    //设置路径起始位置
    ctx.moveTo(x, y);
    //在路径中添加一个节点
    ctx.lineTo(x + 1, y + 1);
    //用画笔颜色绘制路径
    ctx.stroke();
}

/**
 * 处理鼠标事件
 * @param canvas - 画布
 */
function initEventHandlers(canvas) {
    let dragging = false;               //是否可以拖动
    let vertex = -1;                    //拖动的顶点
    let lastX = -1, lastY = -1; //记录上一次鼠标位置

    canvas.onmousedown = function (ev) {
        let x = ev.clientX, y = ev.clientY;
        let rect = ev.target.getBoundingClientRect();

        //判断鼠标是否在canvas内
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            //记录鼠标位置，已修正为canvas内坐标
            lastX = x - rect.left;
            lastY = y - rect.top;

            //判断鼠标是否在顶点附近
            vertex = canDrag(lastX, lastY);
            if (vertex !== -1) {
                dragging = true;
            }
        }
    };

    canvas.onmouseup = function () {
        dragging = false;
    };

    canvas.onmousemove = function (ev) {
        let x = ev.clientX, y = ev.clientY;
        let rect = ev.target.getBoundingClientRect();

        //是否可以拖动
        if (dragging) {
            vertex_pos[vertex][0] = x - rect.left;
            vertex_pos[vertex][1] = y - rect.top;
            //重新绘制
            reDraw(canvas.getContext("2d"), vertex_pos, pointRadius, pointColor, pointEdgeColor, vertex);
        }
        lastX = x - rect.left;
        lastY = y - rect.top;
    };
}

/**
 * 判断鼠标是否在点的附近，如果是则返回点的index，否则返回-1
 * @param x
 * @param y
 * @returns {number}
 */
function canDrag(x, y) {
    //遍历所有顶点
    for (let i = 0; i < vertex_pos.length; i++) {
        if ((vertex_pos[i][0] - x) * (vertex_pos[i][0] - x) + (vertex_pos[i][1] - y) * (vertex_pos[i][1] - y) < pointRadius * pointRadius) {
            return i;
        }
    }
    return -1;
}