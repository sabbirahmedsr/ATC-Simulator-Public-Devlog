### Major Update
* **AI Voice Command**
* **Website** 
    * Tracking & control
* **Student Database**
    * Registration System
    * Student Profile
    * Result System
* **Excercise System**
    * Creating and Deleting Exercie
    * View and Load Exercise
* **Operator Database**
    * Registration System
    * Operator Profile
* **Record and Replay System**
* **Emergency And Misapproach**
* **VR**
	- VR ATC [Voice Command Enabled ATC]
	- VR Visitor [Only Watch the simulation real time]




### VFX
* **Trio Agent Entry by Helicopter** 
অপারেটর কানেক্ট হওয়ার সাথে সাথে এরকম একটা এনিমেশন হবে যে `Tripple Screen` এ তিনটা হেলিকপ্টার আসবে। প্রত্যেকটার নিচে একটা বিশাল `ID Card` ঝুলানো থাকবে। বাম দিকের হেলিকপ্টার এ থাকবে `Departure Operator` এর বিবরণ। মাঝখানের হেলিকপ্টার এ থাকবে `Student Information`। এবং ডান দিকের হেলিকপ্টার এ থাকবে `Arrival Operator` এর বিবরণ। 
এই এনিমেশন-টা কোন একটা বাটনেও দিয়ে দেওয়া যায়। যখন স্পেসিফিক বাটন ক্লিক করা হবে, এই এনিমেশন প্লে হবে।




### Visual Improvement
* **Pushback Car**
* **Airplane Animation** 
    * Propeller Spinning Animation
    * Gears expand/collapse Animation before landing and after takeoff
    * Physics based Landing & takeoff
* **Airplane Explosion FX**
* **Full Airport Environment**
* **Airplane Follow Camera** (Cinematic Camera System)
* **Emergency Vehicle** Fire truck & other to deal with emergency of an aircraft



### Functionality
* **Create At Any Phase** Airplane can be created at any available phase.
* **Create at any percentage** Currently airplane is created at beginning of the path. in upgraded version, there could be an option to set what `percentance of the path` is already completed.
* **Create before one Second** Instead of creating the airplane at beginning of the path, we can create the airplane at previous phase just one seconds before, so that, when a button is clicked, immediately the initial call of this phase can be played.
* **Individual Aircraft Fast Forwad**
* **Individual Aircraft move along phase**
* **Change aircraft phase at runtime**
* **Repeat last Call**
* **Multiple Call Option**
* **Skip Call**
* **Extra Call button** each airplane might have some extra call that can be played at anytime if require like 
    * Roger
    * Can you repeat the command please
    * Continue Approach
    * etc


### UI
* **Flight Level** a vertical procedural bar can be used to visualize the flight level of all aircraft. It can be enlarge or collapse according to max and minimum available height of all active aircraft.
* **Highlight FX** from each panel (strip, command, map node) any ui node can be hightlighted to find or detect them easily.
* **Hover Information** on hover on a map node, a popup will be appeared to visualize the details information of the airplane. it may contain a real image of the aircraft and manufacturing information too.
* **Phase Completion Bar** in strip node or map node, there could be a lifebar or progress bar to show how much percentage of current phase is completed

### UX
* **Redesign Command Node**  
    * Phase Command `initial and feedback command` 
        * will be appeared only when available else will be unclickable
        * there should be option to chose from multiple call
    * Fixed Command
        * Freeze/Unfreeze toggle button
        * Hightlight Button
        * Delete button
        * Skip Call button
        * Repeat last call button
        * Extra Call button
        * Change phase button
        * Change Speed button
    * More Command 
* **Variation of icon and Color**
    * Map node should be different color for Arrival and departure
    * There should be different color for each theme pack
    * Airplane Icon should be the top view of the real aircraft


    