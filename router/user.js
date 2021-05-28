//引入express模块
const express = require( 'express' );
//创建路由器对象
const r = express.Router( );
//引入连接池
const pool = require( '../pool.js' );
//console . log( pool );
//添加路由
//1.用户注册(post      /reg)
//http://127.0.0.1:8080/v1/users/reg
r.post( '/reg' , (req,res,next)=>{
	//1.1获取post请求的数据
	let obj = req.body;
	console . log( obj );
	//1.2验证各项数据是否为空
	if( !obj.uname ){
		//json方法是将js对象转为json对象
		//json和send的作用一样的
		res.send( { code: 401 , msg: 'uname不能为空' } );
		//阻止往后执行
		//这是函数内,使用return
		return;
	}
	if( !obj.upwd ){
		res.send( { code: 402 , msg: 'upwd不能为空' } );
		return;
	}
	if( !obj.email ){
		res.send( { code: 403 , msg: 'email不能为空' } );
		return;
	}
	if( !obj.phone ){
		res.send( { code: 404 , msg: 'phone不能为空' } );
		return;
	}
	//验证手机号码的格式
	//正则表达式.test(手机号码)
	//如果手机号码格式不正确
	if( !/^1[3-9]\d{9}$/.test( obj.phone ) ){
		res.send( { code: 405 , msg: '手机号码格式错误' } );
		return;
	}
	//1.3执行SQL命令
	pool.query( 'insert into xz_user set ?' , [obj] , (err,result)=>{
		if(err){
			//如果数据库执行出现了错误,交给下一个错误处理的中间件执行
			next(err);
			//阻止往后执行
			return;
		}
		console . log( result );
		//表示插入成功
		res.send( {code:200 , msg:'注册成功'} );
	} );
} );
//2.用户登录
//http://127.0.0.1:8080/v1/users/login
//2.1获取post请求的数据
r.post( '/login' , (req,res,next)=>{
	let obj = req.body;
	console . log( obj );
    //2.2验证各项是否为空
	if( !obj.uname ){
		res.send( { code: 401 , msg: '用户名不能为空' } );
		return;
	}
	if( !obj.upwd ){
		res.send( { code: 402 , msg:'密码不能为空' } );
		return;
	}
	//2.3执行SQL命令
	pool.query( 'select * from xz_user where uname=? && upwd=?' , [obj.uname , obj.upwd] , (err,result)=>{
		if(err){
			//如果有错误交给下一个中间件处理
			next( err );
			return;
		}
		console . log( result );
		//查询的结果是数组,如果是一个空数组说明登录失败,否则登录成功
		if( result.length === 0 ){
			res.send( { code: 201 , msg: '登录失败' } );
		}else{
			res.send( { code: 200 , msg: '登录成功' } );
		}
	} );
} );
//3.修改用户(put    /)
//http://127.0.0.1:8080/v1/users/
r.put( '/' , (req,res,next)=>{
	//3.1获取put传递的数据( uid,email,phone,user_name,gender )
	let obj = req.body;
	console . log( obj );
	//3.2验证各项数据是否为空
	let i = 400;		//记录状态码
	for( let k in obj ){
		//每次遍历一个属性,状态码加1
		i++;
		//k属性名     obj[k]属性值
		//console . log( k , obj[k] );
		//如果属性值为空,提示属性名这项不能为空
		if( !obj[k] ){
			res.send( { code: i , msg: `${ k }不能为空` } );
			return;
		}
	}
	//3.3执行SQL命令,修改用户的数据
	pool.query( 'update xz_user set ? where uid=?' , [obj,obj.uid] , (err,result)=>{
		if(err){
			//如果有错误,交给下一个错误处理中间件
			next(err);
			return;
		}
		console . log( result );
		//结果是对象,如果对象下的affectedRows的值是0说明修改失败,否则修改成功
		if( result.affectedRows === 0 ){
			res.send( { code: 201 , msg: '修改失败' } );
		}else{
			res.send( { code: 200 , msg: '修改成功' } );
		}
	} );
} );
//4.查找用户(get	/uid)
//http://127.0.0.1:8080/v1/users/3
r.get( '/:uid' , (req,res,next)=>{
	//4.1获取传递的编号
	let obj = req.params;
	console . log( obj );
	//4.2执行SQL命令,查询对应编号的用户
	pool.query( 'select uid,uname,email,phone from xz_user where uid=?' , [obj.uid] , (err,result)=>{
		if(err){
			next(err);
			return;
		}
		console . log( result );
		if(result.length === 0){
			res.send( { code: 201 , msg: '该用户不存在' } );
		}else{
			res.send( { code: 200 , msg: '查询成功' , data: result } );
		}
	} );
} );
//5.删除用户(get	/uid)
//http://127.0.0.1:8080/v1/users/8
r.delete( '/:uid' , (req,res,next)=>{
	//5.1获取传递的编号
	let obj = req.params;
	console . log( obj );
	//执行SQL命令,删除编号对应的用户
	pool.query( 'delete from xz_user where uid=?' , [obj.uid] , (err,result)=>{
		if(err){
			next(err);
		}
		console . log( result );
		if( result.affectedRows === 0 ){
			res.send( { code: 201 , msg: '删除失败' } );
		}else{
			res.send( { code: 200 , msg: '删除成功' } );
		}
	} );
} );
//6用户列表(get		/)
//http://127.0.0.1:8080/v1/users/
r.get( '/' , (req,res,next)=>{
	//6.1获取查询字符串(get)传递的数据
	let obj = req.query;
	console . log( obj );
	//6.2验证是否为空,如果为空设置默认值
	if(!obj.pno)			obj.pno = 1;
	if(!obj.count)		obj.count = 5;
	console . log( obj );
	//6.3计算页码查询的值
	let start = (obj.pno-1) * obj.count
	//6.4把每页的数据量转为数值型
	let size = parseInt( obj.count );
	//6.5执行SQL命令(分页查询)
	pool.query( 'select uid,uname,email,phone from xz_user limit ?,?' , [start,size] , (err,result)=>{
		if(err){
			next(err);
			return;
		}
		console . log( result );
		//查询结果是数组,把数组响应到浏览器端
		res.send( { code: 200 , msg: '查找成功' , data: result } );
	} );
} );


//导出路由器
module.exports = r;