const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const { name } = require('ejs');
const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB", { useNewUrlparser: true });

const itemsSchema = {
    name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to Your To-Do-List"
});
const item2 = new Item({
    name: "Hit + button to add new item."
});
const item3 = new Item({
    name: "<-- hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listschema={
    name:String,
    new_item:[itemsSchema],
};
const List=mongoose.model("List",listschema);

// let date = require(__dirname + "/date.js");
var items = ["Buy food", "Cook food", "Eat food"];
let newdata = [];

app.get("/", function (req, res) {
    //    var day=date.getDate();
    Item.find().then(function (founditems) {
        if (founditems.length == 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("Default items added successfully:");
            }).catch(function (err) {
                console.log(err);
            });
            res.redirect("/");
        }
        else
        {
            res.render('list', { kindofday: "Today", newitem: founditems});
        }
    
    }).catch(function (err) {
        console.log(err);
    })

})

app.post("/", function (req, res) {
    var item = req.body.nm;
    const listitle=req.body.list;
const newitem=new Item({
    name:item
});
  if(listitle=="Today")
  {
    newitem.save();
    res.redirect("/");
  }
  else
  {
     List.findOne({name:listitle}).then(function(foundList)
     {
       foundList.new_item.push(newitem);
       foundList.save();
       res.redirect("/"+listitle); 
     }).catch(function(err)
     {
        console.log(err);
     });
  }
});

app.get("/:CustomerList",function(req,res)
{

   List.findOne({name:req.params.CustomerList}).then(function(founditems)
   {
    if(!founditems)
    {
        const list=new List({
            name:req.params.CustomerList,
            new_item:defaultItems,
        });
        list.save();
        res.redirect("/"+req.params.CustomerList);
    }
    else
    {
        res.render("list",{kindofday:founditems.name,newitem:founditems.new_item});
    }
    }).catch(function(err)
    {
        console.log(err);
    })
   });


   app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId)
        .then(() => {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/");
        });
    } else {
      List.findOneAndUpdate(
        { name: listName },
        { $pull: { new_item: { _id: checkedItemId } } }
      )
        .then(() => {
          res.redirect("/" + listName);
        })
        .catch(err => {
          console.log(err);
          res.redirect("/" + listName);
        });
    }
  }); 
app.listen(3000, function () {
    console.log('3000 is running');
});