/**
 * @author YellowAfterlife
 */
(function() {
//
var lockElement = false, lockState = 0;
function requestLock(_) {
	lockElement.requestPointerLock();
}
function lockChanged(_) {
	if (document.pointerLockElement == lockElement ||
	document.mozPointerLockElement == lockElement) {
		lockState = 1;
		document.addEventListener("mousemove", lockUpdate, false);
	} else {
		lockState = 0;
		document.removeEventListener("mousemove", lockUpdate, false);
	}
}
var lockDeltaX = 0, lockDeltaY = 0;
var nextDeltaX = 0, nextDeltaY = 0;
function lockUpdate(e) {
	nextDeltaX += e.movementX;
	nextDeltaY += e.movementY;
}
///: Locks the mouse cursor at current position.
window.mouse_lock = function() {
	if (lockElement) window.gml$mouse_unlock();
	lockElement = document.getElementById(window.gml_Script_gmcallback_window_handle());
	lockElement.requestPointerLock = lockElement.requestPointerLock ||
		lockElement.mozRequestPointerLock || function() { };
	lockElement.addEventListener("click", requestLock, false);
	document.addEventListener('pointerlockchange', lockChanged, false);
	document.addEventListener('mozpointerlockchange', lockChanged, false);
};
///: Unlocks the mouse cursor.
window.mouse_unlock = function() {
	if (!lockElement) return;
	document.exitPointerLock = document.exitPointerLock ||
		document.mozExitPointerLock || function() { };
	document.exitPointerLock();
	lockElement.removeEventListener("click", requestLock, false);
	document.removeEventListener('pointerlockchange', lockChanged, false);
	document.removeEventListener('mozpointerlockchange', lockChanged, false);
	lockElement = null;
};
///: Must be called once per step to update mouse_delta_* variables
window.mouse_lock_update = function() {
	lockDeltaX = nextDeltaX; nextDeltaX = 0;
	lockDeltaY = nextDeltaY; nextDeltaY = 0;
};
///
window.mouse_lock_init = function() {
	
}
///
window.mouse_get_delta_x = function() {
	return lockDeltaX;
};
///
window.mouse_get_delta_y = function() {
	return lockDeltaY;
};
///: Returns whether the mouse cursor is indeed locked at the moment.
window.mouse_is_locked = function() {
	return lockElement ? lockState : 0;
};
})();