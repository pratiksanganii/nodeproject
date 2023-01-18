import Chat from "./modules/chat";
import Search from "./modules/search";

if(document.querySelector(".header-search-icon")){
    new Search()
}

if(document.querySelector("#chat-wrapper")){
    new Chat()
}