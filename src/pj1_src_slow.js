// pj1源代码
// 2024 Spring HouBinyang

//设置顶点样式
let pointRadius = 10;
let pointColor = [255, 0, 0];
let pointEdgeColor = [0, 0, 0];

function main() {
    // 获取canvas及其上下文
    let canvas = document.getElementById("myCanvas");
    canvas.width = canvasSize.maxX;
    canvas.height = canvasSize.maxY;
    let ctx = canvas.getContext("2d");

    //将canvas坐标整体偏移0.5，用于解决宽度为1个像素的线段的绘制问题，具体原理详见project文档
    ctx.translate(0.5, 0.5);

    //初始化事件处理函数
    initEventHandlers(canvas);

    //绘制图形
    let tick = function () {   // Start drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAll(ctx, vertex_pos, pointRadius, pointColor, pointEdgeColor);
        requestAnimationFrame(tick);
    };
    tick();
}


// 绘制所有图形
function drawAll(ctx, vertex_pos, pointRadius, pointColor, pointEdgeColor) {
    for (let i = 0; i < polygon.length; i++){
        drawPolygon(ctx, vertex_pos, polygon[i], vertex_color[polygon[i][0]]);
    }

    for (let i = 0; i < vertex_pos.length; i++) {
        drawVertex(ctx, vertex_pos[i][0], vertex_pos[i][1], pointRadius, pointColor, pointEdgeColor);
    }
}

// 填充多边形
function drawPolygon(ctx, vertex_pos, polygon, vertex_color) {
    let allLinePixels = [];
    for (let i = 0; i < polygon.length - 1; i++) {
        allLinePixels.push(saveLinePixels(vertex_pos[polygon[i]][0], vertex_pos[polygon[i]][1], vertex_pos[polygon[i + 1]][0], vertex_pos[polygon[i + 1]][1]));
    }
    allLinePixels.push(saveLinePixels(vertex_pos[polygon[polygon.length - 1]][0], vertex_pos[polygon[polygon.length - 1]][1], vertex_pos[polygon[0]][0], vertex_pos[polygon[0]][1]));

    for (let i = 0; i < canvasSize.maxY; i++) {
        let start = false;
        let end = false;
        ctx.beginPath();
        ctx.strokeStyle = "rgb(" + vertex_color[0] + "," + +vertex_color[1] + "," + +vertex_color[2] + ")";

        for (let j = 0; j < canvasSize.maxX; j++) {
            let touchLineIndex = touchLine(j, i, allLinePixels);
            //let touchVertexIndex = touchVertex(j, i, vertex_pos);

            if (touchLineIndex !== -1) {
                if (start === false) {
                    ctx.moveTo(j, i);
                    start = true;
                    end = false;
                }else {
                    start = false;
                    end = true
                }

                if(end === true){
                    ctx.lineTo(j, i);
                    ctx.stroke();
                }
            }

        }
    }
}

function touchLine(x, y, lines) {
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let j = 0; j < line.length; j++) {
            if (x === line[j].x && y === line[j].y) {
                return i;
            }
        }
    }
    return -1;
}

function saveLinePixels(x1, y1, x2, y2) {
    const vertex1 = [x1, y1];
    const vertex2 = [x2, y2];

    const pixels = []; // 存储像素的数组

    const dx = Math.abs(x2 - x1); // 计算 x 轴方向的差值
    const dy = Math.abs(y2 - y1); // 计算 y 轴方向的差值
    const sx = x1 < x2 ? 1 : -1; // 确定 x 轴的增量方向
    const sy = y1 < y2 ? 1 : -1; // 确定 y 轴的增量方向
    let err = dx - dy; // 用于判断下一个像素点的位置

    pixels.push({x: x1, y: y1});
    pixels.push({x: x2, y: y2});

    //平行线则直接返回端点
    if (dy === 0) {
        return pixels;
    }


    let lastY = -1;

    while (true) {
        if (y1 !== lastY && y1 !== vertex1[1] && y1 !== vertex2[1]) {
            pixels.push({x: x1, y: y1}); // 将当前像素点的坐标保存到数组中
            lastY = y1;
        }

        if (x1 === x2 && y1 === y2) {
            break; // 如果已经到达目标点，则退出循环
        }

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx; // 根据 x 轴的增量方向移动到下一个像素点
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy; // 根据 y 轴的增量方向移动到下一个像素点
        }
    }

    return pixels; // 返回保存的像素坐标数组
}


//绘制点的函数，ctx是canvas的上下文，x和y是点的坐标，pointRadius是点的半径，pointColor是点的颜色，pointEdgeColor是点的边缘颜色
function drawVertex(ctx, x, y, pointRadius, pointColor, pointEdgeColor) {
    for (let i = x - pointRadius; i < x + pointRadius; i++) {
        for (let j = y - pointRadius; j < y + pointRadius; j++) {
            if ((i - x) * (i - x) + (j - y) * (j - y) > pointRadius * pointRadius) {

            } else if ((i - x) * (i - x) + (j - y) * (j - y) > (pointRadius - 1) * (pointRadius - 1)) {
                drawPoint(ctx, i, j, pointEdgeColor);
            } else {
                drawPoint(ctx, i, j, pointColor);
            }
        }
    }
}

//绘制点的函数，ctx是canvas的上下文，x和y是点的坐标，color是点的颜色
function drawPoint(ctx, x, y, color) {
    //建立一条新的路径
    ctx.beginPath();
    //设置画笔的颜色
    ctx.strokeStyle = "rgb(" + color[0] + "," + +color[1] + "," + +color[2] + ")";
    //设置路径起始位置
    ctx.moveTo(x, y);
    //在路径中添加一个节点
    ctx.lineTo(x + 1, y + 1);
    //用画笔颜色绘制路径
    ctx.stroke();
}

//初始化事件处理函数，使得canvas可以响应鼠标事件
function initEventHandlers(canvas) {
    let dragging = false;         // Dragging or not
    let lastX = -1, lastY = -1;   // Last position of the mouse

    canvas.onmousedown = function (ev) {   // Mouse is pressed
        let x = ev.clientX, y = ev.clientY;
        // Start dragging if a moue is in <canvas>
        let rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x - rect.left;
            lastY = y - rect.top
            dragging = true;
        }
    };

    canvas.onmouseup = function () {
        dragging = false;
    }; // Mouse is released

    canvas.onmousemove = function (ev) { // Mouse is moved
        let x = ev.clientX, y = ev.clientY;
        let rect = ev.target.getBoundingClientRect();
        if (dragging) {
            let vertex = canDrag(lastX, lastY);
            if (vertex !== -1) {
                vertex_pos[vertex][0] = x - rect.left;
                vertex_pos[vertex][1] = y - rect.top;
            }
        }
        lastX = x - rect.left;
        lastY = y - rect.top;
    };
}

//判断鼠标是否在点的附近，如果是则返回点的index，否则返回-1
function canDrag(x, y) {
    for (let i = 0; i < vertex_pos.length; i++) {
        if ((vertex_pos[i][0] - x) * (vertex_pos[i][0] - x) + (vertex_pos[i][1] - y) * (vertex_pos[i][1] - y) < pointRadius * pointRadius) {
            return i;
        }
    }
    return -1;
}