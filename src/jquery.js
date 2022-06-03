window.$ = window.jQuery = function(selectorOrArrayOrTags){
    // 所有元素
    let elements;
    if(typeof selectorOrArrayOrTags === 'string'){ // 传入选择器
        // 传入标签文本
        if(selectorOrArrayOrTags[0] === '<'){
            elements = createElement(selectorOrArrayOrTags);
        }else{
            elements = document.querySelectorAll(selectorOrArrayOrTags);
        }
    }else if(selectorOrArrayOrTags instanceof Array){ // 传入之前操作的结果
        elements = selectorOrArrayOrTags;
    }

    function createElement(string){
        const container = document.createElement('template');
        container.innerHTML = string.trim();
        // 获取template中的所有元素
        return container.content.children;
    }

    // 闭包：函数访问外部变量
    // 创建一个api对象,并且设置这个对象的__proto__的值为jQuery.prototype
    // 用于后续.方法进行链式操作
    const api = Object.create(jQuery.prototype);
    // 增加属性 
    // api.oldApi = selectorOrArray.oldApi;
    // 增加属性 assign方法
    Object.assign(api,{
        // 将之前的elements传递到api中
        elements:elements,
        oldApi:selectorOrArrayOrTags.oldApi
    })
    return api;
}

// 将方法放在原型上
jQuery.prototype = {
    constructor:jQuery, // 指定构造函数
    // 获取第几个元素
    get(index){
        return this.elements[index]
    },
    // 插入到指定父元素元素中
    appendTo(parentNode){
        if(parentNode instanceof Element){ // 直接传入原生Dom
            // 如果使用Each  appendChild会造成length的变化,导致元素无法都放入
            while(this.elements[0]){
                parentNode.appendChild(this.elements[0]);
            }
        }else{ // 传入jQuery
            while(this.elements[0]){
                parentNode.get(0).appendChild(this.elements[0]);
            }
        }
        return this;
    },
    // 插入孩子节点
    append(childNode){
        if(childNode instanceof HTMLCollection){  // 原生Dom
            // appendChild 会改变childNode,操作时顺序会变
            // for(let i = 0; i < childNode.length; i++){
            //     this.get(0).appendChild(childNode[i])
            // }
            jQuery(Array.from(childNode)).each((node)=>{
                this.get(0).appendChild(node)
            })
        }else{ // jQuery对象
            childNode.each((node)=>{
                this.get(0).appendChild(node)
            })
        }

        return this;
    },
    // 删除当前元素
    remove(){
        this.each((node)=>{
            node.remove();
        })
    },
    // 清空当前元素内部元素
    empty(){
        this.each((node)=>{
            let childNode = node.childNodes;
            while(1){
                if(childNode[0]===undefined){
                    break;
                }
                childNode[0].remove();
            }
        })
        return this;
    },
    // 获取 修改 标签文本内容
    text(content){
        let result = [];
        if(content===undefined){ // 获取内容
            this.each((node)=>{
                // 防止没有innerText属性
                result.push('innerText' in node ? node.innerText : node.textContent)
            })
            return result;
        }else{
            this.each((node)=>{
                'innerText' in node ? node.innerText=content : node.textContent=content;
            })
            return this;
        }
    },
    // 获取 修改 标签html文本内容
    html(content){
        let result = [];
        if(content === undefined){
            this.each((node)=>{
                result.push(node.innerHTML);
            })
            return result;
        }else{
            this.each((node)=>{
                node.innerHTML=content;
            })
            return this;
        }
    },
    // 获取 设置 属性值
    attr(name,value){
        let result = [];
        if(arguments.length === 2){ // 设置
            this.each((node)=>{
                node.setAttribute(name,value);
            })
            return this;
        }else if(arguments.length === 1){ //获取
            this.each((node)=>{
                result.push(node.getAttribute(name))
            })
            return result;
        }
    },
    // 按照selector查询
    find(selector){
        let result = []; // 存放结果
        for(let i = 0; i < this.elements.length; i++){
            result = result.concat(Array.from(this.elements[i].querySelectorAll(selector)));
        }
        // 保存之前的api
        result.oldApi = this;
        // 将结果重新传入jquery中,继续获取api进行链式操作
        return jQuery(result);
    },
    // addClass() === 'addClass'() === addClass = function()
    addClass(className){
        for(let i = 0; i < this.elements.length; i++){
            this.elements[i].classList.add(className);
        }
        // this是api本身
        return this;
    },
    // 遍历
    each(fn){
        for(let i = 0; i < this.elements.length; i++){
            // 调用fn，this为null，每次传入当前元素和索引
            fn.call(null,this.elements[i],i)
        }
        return this;
    },
    // 获取父亲
    parent(){
        let result = [];
        this.each((node)=>{
            // 插入时去除共同父元素
            if(result.indexOf(node.parentNode) == -1){
                result.push();
            }
        })
        return jQuery(result);
    },
    // 获取儿子
    children(){
        let result = [];
        this.each((node)=>{
            // ES6 ...node.children将数组元素拆开依次插入
            result.push(...node.children);
        })
        return jQuery(result);
    },
    // 获取兄弟
    siblings(){
        let result = [];
        this.each((node)=>{
            let childrens = node.parentNode.children;
            for(let i = 0; i < childrens.length; i++){
                if(childrens[i] !== node)
                    result.push(childrens[i]);
            }
        })
        return jQuery(result);
    },
    // 获取当前元素是第一个
    index(){
        let indexArray = [];
        this.each((node)=>{
            let childrens = node.parentNode.children;
            for(let i = 0; i < childrens.length; i++){
                if(childrens[i] === node)
                    indexArray.push(i+1);
            }
        });
        return indexArray;
    },
    // 获取当前元素的哥哥
    prev(){
        let result = [];
        this.each((node)=>{
            result.push(node.previousElementSibling);
        });
        return jQuery(result);
    },
    // 获取当前元素的弟弟
    next(){
        let result = [];
        this.each((node)=>{
            if(node.nextElementSibling!==null)
                result.push(node.nextElementSibling);
        });
        return jQuery(result);
    },
    // 打印当前元素
    print(){
        console.log(this.elements);
    },
    // 返回上一个api
    end(){
        return this.oldApi; // 返回之前的api
    }
}

// jquery
// 1、创建一个对象用闭包去操作querySelector出来的对象
// 2、return this是将xxxx.xxxx点前面的东西作为当前操作的返回时，从而实现api向后传递

// jquery是一个不需要加new的构造函数
// jquery不是常规意义上的构造函数
// jquery对象：jquery函数构造出来的对象（api）