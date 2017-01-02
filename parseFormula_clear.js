  /**

          *用于解析单元格中函数的模块（支持嵌套，参数，函数体间四则运算）

          *LZC

          *2016-12-24

          **/



//在此定义自定义函数，当函数解析器parseFormula()被调用时会在此寻找匹配的对象单元。
//为该对象添加新的单元，然后赋值给自定义的方法名即可。
//
//格式：
//    var formulaSet = {
//      方法名: 方法
//    };
//
//自定义函数的规则：
//1. 方法名必须小写
//2. 传入的参数中不能含有"="符号
//3. 方法的参数为一个数组
//4. 输出必须为一个字符串或数字
//5. 无法识别空格（初始化时会将所有空格剔除）
//6. 四则运算符两边必须为数字或返回值为数字的函数
//7. 函数必须使用小括号闭合
//8.
//
var formulaSet = {
  '': returnNull,   // 处理函数体为空的情况 比如四则运算(1 + 3) * 2
  'abc': ABC,
  'sum': sum
};
//
// 将自定义方法定在在此
//
function ABC(args){
  var sum = 1;
  for(var i = 0, length1 = args.length; i < length1; i++){
    if(isNaN(+args[i])){
      console.log('ABC 参数异常 ！');
      return;
    }
    sum *= +args[i];
  }

  return sum + $('#cellInput').val();
}


/*
 @method 求和函数
 *
 @param {args} 参数为单元格或单元格组的参数列表，如[a1:b2], [a1], [a1:b2, c1:d2]
 *
 @return {Number} 返回所有单元格内数值的和
 */
function sum(args) {
  var cells = args[0].toLowerCase().split(':'),
      col_num_start = transToNum(sparateId(cells[0])[0]),
      col_num_end = transToNum(sparateId(cells[1])[0]),
      row_num_start = sparateId(cells[0])[1],
      row_num_end = sparateId(cells[1])[1],
      sum = 0;

  // console.log(col_num_start, col_num_end, row_num_start, row_num_end);
  for(var col = col_num_start; col <= col_num_end; col ++) {
    for(var row = row_num_start; row <= row_num_end; row ++) {
      // console.log(transToAlpha(col) + row);
      sum += +cellModel.getCell(transToAlpha(col) + row).value;
    }
  }
  sum += +$('#cellInput').val();
  // console.log('ewawwawawa');
  // console.log('$(#cellInput).val()');
  // console.log($('#cellInput').val());

  return sum;
}
/*
 @method 按列查找
 *
 @param {} 参数为单元格或单元格组的参数列表，如[a1:b2], [a1], [a1:b2, c1:d2]
 *
 @return {Number} 返回所有单元格内数值的和
 */
function sum(args) {
  var cells = args[0].toLowerCase().split(':'),
      col_num_start = transToNum(sparateId(cells[0])[0]),
      col_num_end = transToNum(sparateId(cells[1])[0]),
      row_num_start = sparateId(cells[0])[1],
      row_num_end = sparateId(cells[1])[1],
      sum = 0;

  // console.log(col_num_start, col_num_end, row_num_start, row_num_end);
  for(var col = col_num_start; col <= col_num_end; col ++) {
    for(var row = row_num_start; row <= row_num_end; row ++) {
      // console.log(transToAlpha(col) + row);
      sum += +cellModel.getCell(transToAlpha(col) + row).value;
    }
  }
  // for(cell in cells) {
  //   sum += +args[arg];
  // }
  // console.log(sum);
  return sum;
}
/********/

/**
*
每当单元格检测到用户输入的文本首位为‘=’号时调用此方法进行解析，该方法会将函数体及变量进行分离。并从formulaSet对象中查找
匹配到的自定义函数执行，并返回最终的结果。
注：函数解析器会将所有的参数转换成一个数组传入匹配到的自定义函数内。
*
*
*
@method 公式解析器（支持嵌套，参数，函数体间四则运算）
*
@param {String} 公式文本 如： 方法1(参数1， 参数2) + 方法2（参数3， 参数4）
*
@return {Number || String} 返回值视参数中含有的参数决定，可能为数字或字符串
*
@TODO:  1. 未能处理转义字符如"\'", "\n"等。
        2. 未做输入验证
        3. 浮点数精度未处理
        4. 所有的参数都视作字符串（可在自定义函数中做进一步判断）
*/

var parseFormula = function(formulaOrigin) {
  var formula = '(' + formulaOrigin.replace(/ /g, '').toLowerCase() + ')',           // 去除所有空格及大写以免影响计算
      formulaLength = formula.length,
      formulastack = [],   // 用来储存函数体
      argumentSet = [],             // 参数列表
      temp = '';


  for(var i = 0; i < formulaLength; i ++) {
    var cell = formula[i];
    if( cell == '(') {

      if(/[\*\-+/]/g.test(temp[0])){                                     // 判断函数体间的是否存在四则运算， 如abc(10,20) + abc(30,40)
        var tempArug = argumentSet.pop();                                // 若存在，则将运算符存入上一个参数末尾，以便最后运算时进行识别
        argumentSet.push(tempArug + temp[0]);
        temp = temp.slice(1);
      }
      formulastack.push(temp);                                         // 将函数体放入堆栈中
      argumentSet.push('=');                                           // 用“=”来分割主函数参数与子函数参数
      temp = '';
      continue;
    }

    // 将检测到的参数存入参数列表argumentSet
    if( cell == ',') {
      argumentSet.push(temp);
      temp = '';
      continue;
    }

    // 函数体闭合时开始进行运算
    if( cell == ')') {
      if(temp != 0){                                       //函数体闭合时temp仍为0表示没有参数传入
        argumentSet.push(temp);
      }
      temp = '';
      var formulaBody = formulaSet[formulastack.pop()],   // 推出堆栈最顶层的函数体进行运算
          formulaArgus = argumentSet.slice(argumentSet.lastIndexOf('=') + 1),  // 分离出子函数的参数
          preArgu = argumentSet[argumentSet.lastIndexOf('=') - 1];             // 用于记录上一个函数计算之后的结果，以判断是否存在函数体间的四则运算。

      // 检查函数是否存在
      if(!formulaBody){
        console.log('formulaBody ' + formulaBody);
        // throw '函数不存在';
        console.log('函数不存在')
        return 'ERROR!';
      }

      for(var j = 0; j < formulaArgus.length; j ++ ) {
        var e = formulaArgus[j];
        if(/[\*\-+/]/g.test(e)){
          if(!validEval(e.split(/[\*\-+/]/g))){
            // throw '运算符参数异常！';
            console.log('运算符参数异常！')
            return 'ERROR!';
          }
          formulaArgus[j] = eval(e);
        }
      }

      argumentSet = argumentSet.slice(0, argumentSet.lastIndexOf('='));   // 将已经运算过的参数清除（用“=”标识）
      if(formulaBody(formulaArgus) == undefined){    // 若函数输出为undefined, 则抛出异常
        console.log('函数调用异常');
        return 'ERROR!';
      }
      if(/[\*\-+/]$/g.test(preArgu)){
        var tempArug = argumentSet.pop();
        argumentSet.push(tempArug + formulaBody(formulaArgus));
      }else {

        argumentSet.push(formulaBody(formulaArgus));  // 执行解析到的函数并将其推进参数列表argumentSet
      }
      continue;
    }

    temp += formula[i];
  }
  return argumentSet.pop()[0];

}

// 验证eval()传入的参数
var validEval = function(argu){
  var valid = true;
  argu.forEach( function(element, index) {

    if(isNaN(+element)){
      // console.log(+element);
      valid = false;
      return;
    }
  });
  return valid;
};
// TODO: 验证输入
// validInput = function(formula){
//   var valid = true,
//       backCount = 0,
//       SBCpunct = '。，、；：？！“”（）……—《》';  // 中文标点

//   if

// };


// console.log(parseFormula('abc(10, 20) + abc(1,2)'));
// console.log(parseFormula('sum(b3:c5)'));
// console.log(parseFormula('sum(b2:c2) + 200'));
// console.log('finished');

function returnNull(arg, operater){
  return arg;
}



// ABC([1,2,3,4,5,6]);