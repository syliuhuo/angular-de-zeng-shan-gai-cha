//登录模块
var loginApp = angular.module('loginApp',[]);
loginApp.controller('loginController',function($scope,$http){
    //我们创建的数据
    $scope.formData = {};
    $scope.postForm = function(){
        //这是我们提交表单的业务逻辑
        $scope.formData.action = 'login';
        //随后我们使用$http服务来向服务区发送一个请求
        $http({
            method:'POST',//发送方式
            url:'./get.php',//发送地址
            data:$.param($scope.formData),//发送数据
            headers:{'Content-Type':'application/x-www-form-urlencoded'} //请求头
        })
            .success(function(data){
                //console.log(data);
                //对数据的正确判断
                if(!data.success){
                    if(!data.errors){
                        $scope.message = data.message;
                    }else{
                        $scope.errorUsername = data.errors.username;
                        $scope.errorPassword = data.errors.password;
                    }
                }else{
                    //当密码正确的时候，跳转到列表页面
                    window.location.href = '#/0';

                }
            })
    }
});

//列表模块
var pageList = angular.module('pageList',[]);
pageList.controller('ListTypeCtrl',function($scope,$http){
    $http({
        method:'GET',
        url:'get.php?action=get_arctype&where=reid=0'
    }).success(function(data){
        $scope.lists = data;
    }).error(function(data){
        console.log('error...');
    })
});
//文章页面的列表
//创建arcListCtrl控制器拿到所有的文章
total = 0;
pageList.controller('arcListCtrl',function($scope,$http,$location){
    //首先获取当前的路径
    $scope.typeid = $location.path().replace('/','');
    //然后获取文章的总数量
    if($scope.typeid == 0){
        $get_total_url = 'get.php?action=get_total'
    }else{
        $get_total_url = 'get.php?action=get_total&where=typeid=' + $scope.typeid;

    }
    //发送请求，得到文章的总数量
    $http({
        method:'GET',
        url:$get_total_url
    }).success(function(data){
        $scope.paginationConf.totalItems = data.total;
    }).error(function(data){
        console.log('err...')
    });

    //获取文章的总数量之后，设置分页
    $scope.paginationConf = {
        //当前页数
        currentPage:1,
        //跟每页多少数据有关
        itemsPerPage:5,
        //每页的数据长度
        pagesLength:5,
        //这里添加一个S
        perPageOptions:[10, 20, 30, 40, 50],
        rememberPerPage:'perPageItems',
        onChange:function(){
            //获取分页的开始数
            if($scope.paginationConf.currentPage == 1){
                $scope.limit = 0;
            }else{
                //第一页的话,0 ,5 第二页 5,10,第三页 10,15
                $scope.limit = $scope.paginationConf.currentPage * $scope.paginationConf.itemsPerPage - $scope.paginationConf.itemsPerPage
            }
            //根据当前的type类型，显示不同的分类里面的文章页面
            //这里因为莫名的空格问题造成了URL的错误，要注意
            if($scope.typeid == 0){
                $get_url = 'get.php?action=get_list&offset=' + $scope.limit + '&rows=' + $scope.paginationConf.itemsPerPage + '&orderField=id&orderBy=DESC';
            }else{
                $get_url='get.php?action=get_list&offset='+$scope.limit+'&rows='+$scope.paginationConf.itemsPerPage+'&where=typeid='+$scope.typeid+'&orderField=id&orderBy=DESC';
            }
            //开始发送请求
            $http({
                method:'GET',
                url:$get_url
            }).success(function(data){
                $scope.lists = data;
            }).error(function(data){
                console.log('error...')
            })
        }
    };
    //删除
    $scope.del = function(index,Id){
        console.log(index);
        console.log(Id);
        $scope.lists.splice(index,1);
        $http({
            method:'GET',
            url:'get.php?action=delete_article&id=' + Id
        })
            .success(function(data) {
                console.log(data);
                if (data.code==101) {
                    //删除成功
                    console.log('删除成功');
                    $scope.meg_success="删除成功！";
                    $("#successbox").animate({opacity:'1'}).addClass("slideDown");
                    setTimeout(function(){$("#successbox").removeClass().animate({opacity:'0'});}, 800);
                    setTimeout(function(){window.location.reload()},2000);
                } else {
                    //删除失败
                    console.log('删除失败');
                    $scope.meg_success="";
                    $scope.meg_error="删除失败! ";
                    $("#errorbox").animate({opacity:'1'}).addClass("slideDown");
                    setTimeout(function(){$("#errorbox").removeClass().animate({opacity:'0'});}, 800);
                }
            });
    };


});

//新增
var addCont = angular.module('addCont',[]);
addCont.controller('addContCtrl',function($scope,$http){
    $http({
        method:'GET',
        url:'get.php?action=get_arctype&where=reid=0'
    }).success(function(data){
        $scope.lists = data;
    }).error(function(data){
        console.log('error...');
    });
    //第二步，执行写入操作
    $scope.formData = {};
    $scope.formData.action = 'add_article';
    $scope.postForm = function(){
        $http({
            method:'POST',
            url:'get.php',
            data: $.param($scope.formData),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).success(function(data){
            $scope.errorBye = function(){
                $('#errorbox').fadeOut();

            };
            $scope.errorShow = function(){
                $('#errorbox').fadeIn();
            };
            if(!data.errors){
                //成功
                $scope.meg_success = '插入成功';
                $scope.meg_error = '';
                setTimeout(function(){location.href = '#/0'},1000)
            }else{
                //失败
                $scope.meg_success = '';
                var get_error = '';
                if(data.errors.hasOwnProperty('title')){
                    get_error = data.errors.title;
                }
                if(data.errors.hasOwnProperty('content')){
                    get_error = data.errors.content;
                }
                if(data.errors.hasOwnProperty('typeid')){
                    get_error = data.errors.typeid;
                }
                $scope.meg_error = get_error;
            }
        })
    }
});

//修改模块
var modifyCont = angular.module('modifyCont',[]);
modifyCont.controller('modifyContCtrl',function($scope,$http,$stateParams){
    //获取分类的列表
    $http({
        method:"GET",
        url:'get.php?action=get_arctype&where=reid=0'
    }).success(function(data){
        $scope.types = data;
    });
    //读取文章信息
    $http({
        method:'GET',
        url:'get.php?action=get_article&id=' + $stateParams.Id
    }).success(function(data){
        $scope.lists = data;
    }).error(function(data){
        console.log('error...')
    });
    //更新数据
    $scope.formData = {};
    $scope.postForm = function(){
        $scope.formData.action = 'update_article';
        $scope.formData.id=$stateParams.Id;
        $scope.formData.title = form.title.value;
        $scope.formData.content = form.content.value;
        $scope.formData.typeid = $('#typeid option:selected').val();

    //发送数据
        $http({
            method:'POST',
            url:'get.php',
            data: $.param($scope.formData),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).success(function(data){
            console.log(data);
            if(data.code == 101){
                $scope.meg_success = '修改成功';
                $scope.meg_error = '';
                setTimeout(function(){
                    location.href = '#/0'
                },1000)
            }else{
                var meg_success = '';
                var get_error = '';
                $scope.errorBye = function(){
                    $('#errorbox').fadeOut();
                };
                $scope.errorShow = function(){
                    $('#errorbox').fadeIn();
                };
                if(data.errors){
                    if(data.errors.hasOwnProperty('title')){
                        get_error = data.error.title;
                    }
                    if(data.errors.hasOwnProperty('content')){
                        get_error = data.errors.content;
                    }
                    $scope.meg_error = get_error;
                }else{
                    $scope.meg_error = '修改失败，无任何改动'
                }
            }
        })
    }
});

//查询模块
var showCont = angular.module('showCont',[]);
showCont.controller('showContCtrl',function($scope,$http,$stateParams){
    $http({
        method:'GET',
        url:'get.php?action=get_article&id=' + $stateParams.Id
    }).success(function(data){
        $scope.lists = data;
    }).error(function(data){
        console.log('error...')
    })
});

