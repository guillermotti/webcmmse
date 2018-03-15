import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';
import { Query } from '@firebase/firestore-types';

@Injectable()
export class FirebaseCallerService {

  constructor(private db: AngularFirestore) { }

  public getCollection(collection): Observable<any[]> {
    return this.db.collection(collection).valueChanges();
  }

  public addItemToCollection(collection, item): any {
    return this.db.collection(collection).add(item)
    .catch(function(error) {
      console.error('Error', error);
    });
  }

  public getItemFromCollection(item, collection): Observable<any[]> {
    return this.db.collection(collection, ref => ref.where('email', '==', item)).valueChanges();
  }
}
