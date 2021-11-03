document.addEventListener("DOMContentLoaded", function() { display_pattern();});

function display_pattern()
{
 var lock= new PatternLock('#pattern1',{
 onDraw:function(pattern){
  document.getElementById("pattern_val").value=lock.getPattern();
  display_pattern2();
 }
 });
}

function hide_show_pattern()
{
 if(document.getElementById("pattern_val").value!="")
 {
  document.getElementById("pattern1_container").style.display="none";
  document.getElementById("pattern2_container").style.display="block";
 }
 else
 {
  alert("Please Set Pattern Lock");
 }
}

function display_pattern2()
{
 var pattern_value=document.getElementById("pattern_val").value;
 var lock= new PatternLock('#pattern2',{
 onDraw:function(pattern)
 {
  lock.checkForPattern(pattern_value,function()
 {
  alert("Pattern Lock is Right");
 },
 function()
 {
  alert("Pattern Lock Is Wrong");
 });
}
});
}